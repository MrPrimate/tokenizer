/**
 * Game Settings: Directory
 */

import logger from "../libs/logger.js";

const FPClass = foundry.applications.apps.FilePicker.implementation;

class DirectoryPicker extends FPClass {

  // FilePicker URLs are encoded; local filesystem paths must be decoded once.
  // Remote storage keys are kept as supplied by their provider.
  static decodePath(path, source = "data") {
    if (!["data", "public"].includes(source) || (/^https?:\/\//i).test(path)) return path;
    return path.replace(/(?:%[0-9a-f]{2})+/gi, (sequence) => {
      try {
        return decodeURIComponent(sequence);
      } catch {
        return sequence;
      }
    });
  }

  static async uploadToPath(path, file) {
    const options = DirectoryPicker.parse(path);
    return FPClass.upload(options.activeSource, options.current, file, { bucket: options.bucket }, { notify: false });
  }


  // formats the data into a string for saving it as a GameSetting
  static format(value) {
    return value.bucket !== null
      ? `[${value.activeSource}:${value.bucket}] ${value.path ?? value.current ?? ""}`
      : `[${value.activeSource}] ${value.path ?? value.current ?? ""}`;
  }

  // parses the string back to something the FilePicker can understand as an option
  static parse(inStr) {
    const str = inStr ?? '';
    let matches = str.match(/\[(.+)\]\s*(.+)?/u);

    if (matches) {
      let [, source, current = ''] = matches;
      current = current.trim();
      const [s3, bucket] = source.split(":");
      if (bucket !== undefined) {
        return {
          activeSource: s3,
          bucket: bucket,
          current: DirectoryPicker.decodePath(current, s3),
          fullPath: inStr,
        };
      } else {
        return {
          activeSource: s3,
          bucket: null,
          current: DirectoryPicker.decodePath(current, s3),
          fullPath: inStr,
        };
      }
    }
    // failsave, try it at least
    return {
      activeSource: "data",
      bucket: null,
      current: DirectoryPicker.decodePath(str),
    };
  }

  static extractUrl(str) {
    let options = DirectoryPicker.parse(str);
    if (options.activeSource === "data" || options.activeSource === "public") {
      return undefined;
    } else {
      return options.current;
    }
  }


  static async forgeCreateDirectory(target) {
    if (!target) return;
    const response = await ForgeAPI.call('assets/new-folder', { path: target });
    if (!response || response.error) {
      throw new Error(response ? response.error : "Unknown error while creating directory.");
    }
  }

  /**
   * @param  {string} source
   * @param  {string} target
   * @param  {object} options={}
   */
  static async createDirectory(source, target, options = {}) {
    if (!target) {
      throw new Error("No directory name provided");
    }
    if (typeof ForgeVTT !== "undefined" && ForgeVTT?.usingTheForge) {
      return DirectoryPicker.forgeCreateDirectory(target);
    }
    return FPClass.createDirectory(source, target, options);
  }

  /**
   * Verifies server path exists, and if it doesn't creates it.
   *
   * @param  {object} parsedPath - output from DirectoryPicker,parse
   * @param  {string} targetPath - if set will check this path, else check parsedPath.current
   * @returns {boolean} - true if verfied, false if unable to create/verify
   */
  static async verifyPath(parsedPath, targetPath = null) {
    try {
      const target = targetPath === null
        ? parsedPath.current
        : DirectoryPicker.decodePath(targetPath, parsedPath.activeSource);
      const paths = target.split("/").filter((part) => part !== "");
      let currentSource = "";

      for (let i = 0; i < paths.length; i += 1) {
        try {
          currentSource = currentSource ? `${currentSource}/${paths[i]}` : paths[i];
          // eslint-disable-next-line no-await-in-loop
          await DirectoryPicker.createDirectory(parsedPath.activeSource, `${currentSource}`, { bucket: parsedPath.bucket });

        } catch (err) {
          // eslint-disable-next-line no-await-in-loop
          if (!await DirectoryPicker.isExistingDirectory(parsedPath, currentSource, err)) return false;
        }
      }
    } catch (err) {
      return false;
    }

    return true;
  }

  static async isExistingDirectory(parsedPath, currentSource, error) {
    const message = String(error?.message ?? error).replace(/^Error: /, "").trim();
    if (message.startsWith("EEXIST") || message.startsWith("The S3 key")) return true;
    try {
      // Existing directories may be reported with a localized message.
      await FPClass.browse(parsedPath.activeSource, currentSource, { bucket: parsedPath.bucket });
      return true;
    } catch {
      logger.error(`Error trying to verify path [${parsedPath.activeSource}], ${parsedPath.current}`, error);
      return false;
    }
  }

  static async getForgeUrl(directoryPath, filename) {
    const dir = DirectoryPicker.parse(directoryPath);
    const prefix = ForgeVTT.ASSETS_LIBRARY_URL_PREFIX + await ForgeAPI.getUserId();
    return `${prefix}/${dir.current}/${filename}`;
    
  }

  static async getFileUrl(directoryPath, filename) {
    let uri;
    try {
      if (typeof ForgeVTT !== "undefined" && ForgeVTT?.usingTheForge) {
        uri = await DirectoryPicker.getForgeUrl(directoryPath, filename);
        return uri;
      } else {
        const dir = DirectoryPicker.parse(directoryPath);
        if (dir.activeSource == "data") {
          // Local on-server file system
          uri = dir.current + "/" + filename;
        } else if (dir.activeSource == "forgevtt") {
          const status = ForgeAPI.lastStatus || (await ForgeAPI.status());
          const userId = status.user;
          uri = `https://assets.forge-vtt.com/${userId}/${dir.current}/${filename}`;
        } else if (dir.activeSource == "s3") {
          // S3 Bucket
          uri = `https://${dir.bucket}.${game.data.files.s3.endpoint.hostname}/${dir.current}/${filename}`;
        } else {
          logger.error("Tokenizer cannot handle files stored in that location", dir);
        }
      }
    } catch (exception) {
      throw new Error(`Unable to determine file URL for directoryPath "${directoryPath}" and filename "${filename}"`);
    }
    return encodeURI(uri);
  }
}

export default DirectoryPicker;

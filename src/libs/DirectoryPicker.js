/**
 * Game Settings: Directory
 */

import logger from "../libs/logger.js";


class DirectoryPicker extends FilePicker {
  constructor(options = {}) {
    super(options);
  }

  _onSubmit(event) {
    event.preventDefault();
    const path = event.target.target.value;
    const activeSource = this.activeSource;
    const bucket = event.target.bucket ? event.target.bucket.value : null;
    this.field.value = DirectoryPicker.format({
      activeSource,
      bucket,
      path,
    });
    this.close();
  }

  static async uploadToPath(path, file) {
    const options = DirectoryPicker.parse(path);
    return FilePicker.upload(options.activeSource, options.current, file, { bucket: options.bucket }, { notify: false });
  }

  // returns the type "Directory" for rendering the SettingsConfig
  static Directory(val) {
    return val === null ? '' : String(val);
  }

  // formats the data into a string for saving it as a GameSetting
  static format(value) {
    return value.bucket !== null
      ? `[${value.activeSource}:${value.bucket}] ${value.path}`
      : `[${value.activeSource}] ${value.path}`;
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
          current: current,
        };
      } else {
        return {
          activeSource: s3,
          bucket: null,
          current: current,
        };
      }
    }
    // failsave, try it at least
    return {
      activeSource: "data",
      bucket: null,
      current: str,
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

  // Adds a FilePicker-Simulator-Button next to the input fields
  static processHtml(html) {
    $(html)
      .find(`input[data-dtype="Directory"]`)
      .each((index, element) => {
        // $(element).prop("readonly", true);

        if (!$(element).next().length) {
          logger.debug("Adding Picker Button");
          let picker = new DirectoryPicker({
            field: $(element)[0],
            ...DirectoryPicker.parse($(element).val()),
          });
          let pickerButton = $(
            '<button type="button" class="file-picker" data-type="imagevideo" data-target="img" title="Pick directory"><i class="fas fa-file-import fa-fw"></i></button>'
          );
          pickerButton.on("click", () => {
            picker.render(true);
          });
          $(element).parent().append(pickerButton);
        }
      });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // remove unnecessary elements
    $(html).find("ol.files-list").remove();
    $(html).find("footer div").remove();
    $(html).find("footer button").text("Select Directory");
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
    return FilePicker.createDirectory(source, target, options);
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
      const paths = (targetPath) ? targetPath.split("/") : parsedPath.current.split("/");
      let currentSource = paths[0];

      for (let i = 0; i < paths.length; i += 1) {
        try {
          if (currentSource !== paths[i]) {
            currentSource = `${currentSource}/${paths[i]}`;
          }
          // eslint-disable-next-line no-await-in-loop
          await DirectoryPicker.createDirectory(parsedPath.activeSource, `${currentSource}`, { bucket: parsedPath.bucket });

        } catch (err) {
          if (!err.startsWith("EEXIST") && !err.startsWith("The S3 key")) logger.error(`Error trying to verify path [${parsedPath.activeSource}], ${parsedPath.current}`, err);
        }
      }
    } catch (err) {
      return false;
    }

    return true;
  }
}

// eslint-disable-next-line no-unused-vars
Hooks.on("renderSettingsConfig", (app, html, user) => {
  DirectoryPicker.processHtml(html);
});

export default DirectoryPicker;

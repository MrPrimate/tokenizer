import logger from "../logger.js";
import CONSTANTS from "../constants.js";
import DirectoryPicker from "./DirectoryPicker.js";

export class TokenizerSaveLocations extends FormApplication {

  constructor(tokenizer) {
    super();
    this.tokenizer = tokenizer;
    this.data = [];
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "tokenizer-save-locations";
    options.template = "modules/vtta-tokenizer/templates/file-paths.hbs";
    options.width = 500;
    return options;
  }

  // eslint-disable-next-line class-methods-use-this
  get title() {
    return game.i18n.localize("vtta-tokenizer.label.save-locations");
  }

  // in foundry v10 we no longer get read only form elements back
  /** @override */
  _getSubmitData(updateData = {}) {
    let data = super._getSubmitData(updateData);

    for (const element of this.form.elements) {
      if (element.readOnly) {
        const name = element.name;
        const field = this.form.elements[name];
        setProperty(data, name, field.value);
      }
    }

    return data;
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async getData() {

    this.data = [
      {
        key: "avatar",
        name: game.i18n.localize("vtta-tokenizer.label.avatar"),
        directoryPath: this.tokenizer.avatarUploadDirectory,
        fileName: this.tokenizer.avatarFileName,
      },
      {
        key: "token",
        name: game.i18n.localize("vtta-tokenizer.label.token"),
        directoryPath: this.tokenizer.tokenUploadDirectory,
        fileName: this.tokenizer.tokenFileName,
      }
    ];

    return { type: this.data };
  }

  /** @override */

  async _updateObject(event, formData) {
    event.preventDefault();

    const directoryStatus = [];

    for (const dataType of this.data) {
      const value = formData[`${dataType.key}UploadDirectory`];
      // eslint-disable-next-line no-await-in-loop
      directoryStatus.push({
        key: dataType.key,
        value: dataType.value,
        isBad: CONSTANTS.BAD_DIRS.includes(value),
        // eslint-disable-next-line no-await-in-loop
        isValid: await DirectoryPicker.verifyPath(DirectoryPicker.parse(value)),
      });
    }

    if (directoryStatus.some((dir) => dir.isBad)) {
      $("tokenizer-directory-setup").text(
        `Please set the image upload directory(s) to something other than the root.`
      );
      $("#ddb-importer-folders").css("height", "auto");
      logger.error("Error setting Image directory", {
        directoryStatus,
      });
      throw new Error(
        `Please set the image upload directory to something other than the root.`
      );
    } else if (directoryStatus.some((dir) => !dir.isValid)) {
      $("#munching-folder-setup").text(`Directory Validation Failed.`);
      $("#ddb-importer-folders").css("height", "auto");
      logger.error("Error validating Image directory", {
        directoryStatus,
      });
      throw new Error(`Directory Validation Failed.`);
    } else {
      this.tokenizer.avatarUploadDirectory = formData["avatarUploadDirectory"];
      this.tokenizer.tokenUploadDirectory = formData["tokenUploadDirectory"];
      this.tokenizer.avatarFileName = formData["avatarFileName"];
      this.tokenizer.tokenFileName = formData["tokenFileName"];
      logger.debug("Changed tokenizer save paths to...", {
        avatarUploadDirectory: this.tokenizer.avatarUploadDirectory,
        tokenUploadDirectory: this.tokenizer.tokenUploadDirectory,
        avatarFileName: this.tokenizer.avatarFileName,
        tokenFileName: this.tokenizer.tokenFileName,
      });
    }
  }
}

Hooks.on("renderTokenizerSaveLocations", (app, html) => {
  DirectoryPicker.processHtml(html);
});

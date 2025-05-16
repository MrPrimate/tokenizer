import logger from "../libs/logger.js";
import CONSTANTS from "../constants.js";
import DirectoryPicker from "./DirectoryPicker.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const FPClass = foundry.applications?.apps?.FilePicker?.implementation ?? FilePicker;


export class TokenizerSaveLocations extends HandlebarsApplicationMixin(ApplicationV2) {

  constructor(tokenizer) {
    super();
    this.tokenizer = tokenizer;
    this.data = [];
  }

  static PARTS = {
    form: {
      template: "modules/vtta-tokenizer/templates/save-locations/form.hbs",
    },
    footer: {
      template: "modules/vtta-tokenizer/templates/save-locations/footer.hbs",
    },
  };

    /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    id: "tokenizer-save-locations",
    classes: ["standard-form"],
    actions: {
      selectDirectory: TokenizerSaveLocations.selectDirectory,
    },
    position: {
      width: "500",
      height: "auto",
    },
    window: {
      resizable: false,
      minimizable: false,
      subtitle: "",
    },
    tag: "form",
    form: {
      handler: TokenizerSaveLocations.formHandler,
      submitOnChange: false,
      closeOnSubmit: false,
    },
  };

  // eslint-disable-next-line class-methods-use-this
  get title() {
    return game.i18n.localize("vtta-tokenizer.label.save-locations");
  }

  async _prepareContext() {
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
      },
    ];

    return { type: this.data };
  }

  static async selectDirectory(event, target) {
    const targetDirSetting = target.dataset.target;
    const currentDir = this.tokenizer[targetDirSetting];
    // const parsedDir = FileHelper.parseDirectory(currentDir);
    const current = await DirectoryPicker.getFileUrl(currentDir, "");

    const filePicker = new FPClass({
      type: "folder",
      current: current,
      // source: parsedDir.activeSource,
      // activeSource: parsedDir.activeSource,
      // bucket: parsedDir.bucket,
      callback: async (path, picker) => {
        const activeSource = picker.activeSource;
        const bucket = activeSource === "s3" && picker.sources.s3?.bucket && picker.sources.s3.bucket !== ""
          ? picker.sources.s3.bucket
          : null;

        const formattedPath = DirectoryPicker.format({
          activeSource,
          bucket,
          path,
        });

        this.element.querySelector(`input[name='${targetDirSetting}']`).value = formattedPath;
      },
    });
    filePicker.render();

  }


  /**
   * Process form submission for the sheet
   * @this {DDBLocationSetup}                      The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async formHandler(event, form, formData) {
    const directoryStatus = [];

    for (const dataType of this.data) {
      const value = formData.object[`${dataType.key}UploadDirectory`];
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
      for (const data of directoryStatus.filter((dir) => dir.isBad)) {
        ui.notifications.error(
          `Please set the image upload directory for ${data.name} to something other than the root.`,
          { permanent: true },
        );
        logger.error("Error setting Image directory", {
          directoryStatus,
          data,
        });
      }
    } else if (directoryStatus.some((dir) => !dir.isValid)) {
      for (const data of directoryStatus.filter((dir) => !dir.isValid)) {
        ui.notifications.error(
          `Directory Validation Failed for ${data.name} please check it exists and can be written to.`,
          { permanent: true },
        );
        logger.error("Error validating Image directory", {
          directoryStatus,
          data,
        });
      }
    } else {
      this.tokenizer.avatarUploadDirectory = formData.object["avatarUploadDirectory"];
      this.tokenizer.tokenUploadDirectory = formData.object["tokenUploadDirectory"];
      this.tokenizer.avatarFileName = formData.object["avatarFileName"];
      this.tokenizer.tokenFileName = formData.object["tokenFileName"];
      logger.debug("Changed tokenizer save paths to...", {
        avatarUploadDirectory: this.tokenizer.avatarUploadDirectory,
        tokenUploadDirectory: this.tokenizer.tokenUploadDirectory,
        avatarFileName: this.tokenizer.avatarFileName,
        tokenFileName: this.tokenizer.tokenFileName,
      });
      this.close();
    }

  }
}

import ImagePicker from "./libs/ImagePicker.js";
import DirectoryPicker from "./libs/DirectoryPicker.js";
import logger from "./logger.js";
import CONSTANTS from "./constants.js";

class ResetCustomFrames extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "cleanup-custom-frames";
    options.template = `${CONSTANTS.PATH}/templates/cleanup.hbs`;
    return options;
  }

  // eslint-disable-next-line class-methods-use-this
  get title() {
    return "Reset Custom Frames";
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async getData() {
    return {};
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async _updateObject() {
    game.settings.set(CONSTANTS.MODULE_ID, "custom-frames", []);
  }
}

export function registerSettings() {
  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-pc", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-pc.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-frame-pc.hint`,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/default-frame-pc.png`,
    scope: "world",
    config: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-npc", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-npc.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-frame-npc.hint`,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/default-frame-npc.png`,
    scope: "world",
    config: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-neutral", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-neutral.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-frame-neutral.hint`,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/default-frame-npc.png`,
    scope: "world",
    config: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "frame-directory", {
    name: `${CONSTANTS.MODULE_ID}.frame-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.frame-directory.hint`,
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "add-frame-default", {
    name: `${CONSTANTS.MODULE_ID}.add-frame-default.name`,
    hint: `${CONSTANTS.MODULE_ID}.add-frame-default.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "custom-frames", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "reset-custom-frames", {
    name: `${CONSTANTS.MODULE_ID}.reset-custom-frames.name`,
    hint: `${CONSTANTS.MODULE_ID}.reset-custom-frames.hint`,
    label: `${CONSTANTS.MODULE_ID}.reset-custom-frames.name`,
    scope: "client",
    config: true,
    type: ResetCustomFrames,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "image-upload-directory", {
    name: `${CONSTANTS.MODULE_ID}.image-upload-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.image-upload-directory.hint`,
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] tokenizer/pc-images",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "npc-image-upload-directory", {
    name: `${CONSTANTS.MODULE_ID}.npc-image-upload-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.npc-image-upload-directory.hint`,
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] tokenizer/npc-images",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "image-save-type", {
    name: `${CONSTANTS.MODULE_ID}.image-save-type.name`,
    hint: `${CONSTANTS.MODULE_ID}.image-save-type.hint`,
    scope: "world",
    config: true,
    default: "webp",
    choices: { webp: "*.webp", png: "*.png" },
    type: String,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "token-size", {
    name: `${CONSTANTS.MODULE_ID}.token-size.name`,
    hint: `${CONSTANTS.MODULE_ID}.token-size.hint`,
    scope: "player",
    config: true,
    type: Number,
    default: 400,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "portrait-size", {
    name: `${CONSTANTS.MODULE_ID}.portrait-size.name`,
    hint: `${CONSTANTS.MODULE_ID}.portrait-size.hint`,
    scope: "player",
    config: true,
    type: Number,
    default: 400,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "title-link", {
    name: `${CONSTANTS.MODULE_ID}.title-link.name`,
    hint: `${CONSTANTS.MODULE_ID}.title-link.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disable-avatar-click", {
    name: `${CONSTANTS.MODULE_ID}.disable-avatar-click.name`,
    hint: `${CONSTANTS.MODULE_ID}.disable-avatar-click.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disable-avatar-click-user", {
    name: `${CONSTANTS.MODULE_ID}.disable-avatar-click-user.name`,
    hint: `${CONSTANTS.MODULE_ID}.disable-avatar-click-user.hint`,
    scope: "player",
    config: true,
    type: String,
    choices: {
      global: "Use global setting",
      tokenizer: "Tokenizer",
      default: "Default File Picker",
    },
    default: "global",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "proxy", {
    scope: "world",
    config: false,
    type: String,
    default: "https://images.ddb.mrprimate.co.uk/",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "force-proxy", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "paste-target", {
    scope: "player",
    config: false,
    type: String,
    default: "token",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "token-only-toggle", {
    name: `${CONSTANTS.MODULE_ID}.token-only-toggle.name`,
    hint: `${CONSTANTS.MODULE_ID}.token-only-toggle.hint`,
    scope: "player",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disable-omfg-frames", {
    name: `${CONSTANTS.MODULE_ID}.disable-omfg-frames.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disable-jcolson-frames", {
    name: `${CONSTANTS.MODULE_ID}.disable-jcolson-frames.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-color", {
    name: `${CONSTANTS.MODULE_ID}.default-color.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-color.hint`,
    scope: "player",
    config: true,
    type: String,
    default: "white",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-color-layer", {
    name: `${CONSTANTS.MODULE_ID}.default-color-layer.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-token-offset", {
    name: `${CONSTANTS.MODULE_ID}.default-token-offset.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-token-offset.hint`,
    scope: "player",
    config: true,
    default: -35,
    type: Number,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-algorithm", {
    name: `${CONSTANTS.MODULE_ID}.default-algorithm.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-crop-image", {
    name: `${CONSTANTS.MODULE_ID}.default-crop-image.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-crop-image.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "log-level", {
    name: `${CONSTANTS.MODULE_ID}.log-level.name`,
    scope: "world",
    config: true,
    type: String,
    choices: {
      DEBUG: "DEBUG",
      INFO: "INFO",
      WARN: "WARN",
      ERR: "ERROR ",
      OFF: "OFF",
    },
    default: "INFO",
  });

  logger.debug("Init complete");
}

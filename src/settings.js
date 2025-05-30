import ImagePicker from "./libs/ImagePicker.js";
import logger from "./libs/logger.js";
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
    return {
      labels: {
        name: game.i18n.localize(`${CONSTANTS.MODULE_ID}.reset-custom-frames.name`),
        list: game.i18n.localize(`${CONSTANTS.MODULE_ID}.reset-custom-frames.list`),
      },
    };
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async _updateObject() {
    game.settings.set(CONSTANTS.MODULE_ID, "custom-frames", []);
  }
}

class ResetCustomMasks extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "cleanup-custom-masks";
    options.template = `${CONSTANTS.PATH}/templates/cleanup.hbs`;
    return options;
  }

  // eslint-disable-next-line class-methods-use-this
  get title() {
    return "Reset Custom Masks";
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async getData() {
    return {
      labels: {
        name: game.i18n.localize(`${CONSTANTS.MODULE_ID}.reset-custom-masks.name`),
        list: game.i18n.localize(`${CONSTANTS.MODULE_ID}.reset-custom-masks.list`),
      },
    };
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async _updateObject() {
    game.settings.set(CONSTANTS.MODULE_ID, "custom-masks", []);
  }
}

class QuickSettings extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "quick-settings";
    options.template = `${CONSTANTS.PATH}/templates/quick-settings.hbs`;
    return options;
  }

  // eslint-disable-next-line class-methods-use-this
  get title() {
    return game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.label`);
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async getData() {
    return {
      labels: {
        description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.description`),
        "tokenring-colour": {
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-colour.label`),
          description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-colour.description`),
        },
        "tokenring-texture": {
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-texture.label`),
          description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-texture.description`),
        },
        "tokenring-transparent": {
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-transparent.label`),
          description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.tokenring-transparent.description`),
        },
        dynamicring: {
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.dynamicring.label`),
          description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.dynamicring.description`),
        },
        nothing: {
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.nothing.label`),
          description: game.i18n.localize(`${CONSTANTS.MODULE_ID}.quick-settings.nothing.description`),
        },
      },
    };
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async _updateObject(event) {
    switch (event.submitter.id) {
      case "tokenring-colour": {
        await game.settings.set(CONSTANTS.MODULE_ID, "add-frame-default", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-color-layer", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "add-mask-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "enable-default-texture-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-token-offset", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.default-token-offset`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "token-size", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.token-size`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", false);
        // game.settings.set(CONSTANTS.MODULE_ID, "frame-tint", false);
        break;
      }
      case "tokenring-texture": {
        await game.settings.set(CONSTANTS.MODULE_ID, "add-frame-default", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-color-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "add-mask-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "enable-default-texture-layer", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-token-offset", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.default-token-offset`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "token-size", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.token-size`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", false);
        // game.settings.set(CONSTANTS.MODULE_ID, "frame-tint", false);
        break;
      }
      case "tokenring-transparent": {
        await game.settings.set(CONSTANTS.MODULE_ID, "add-frame-default", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-color-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "add-mask-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "enable-default-texture-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-token-offset", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.default-token-offset`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "token-size", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.token-size`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", false);
        // game.settings.set(CONSTANTS.MODULE_ID, "frame-tint", false);
        break;
      }
      case "dynamicring": {
        await game.settings.set(CONSTANTS.MODULE_ID, "add-frame-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-color-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "add-mask-default", true);
        await game.settings.set(CONSTANTS.MODULE_ID, "enable-default-texture-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-token-offset", -65);
        await game.settings.set(CONSTANTS.MODULE_ID, "token-size", game.settings.settings.get(`${CONSTANTS.MODULE_ID}.token-size`).default);
        await game.settings.set(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", true);
        // game.settings.set(CONSTANTS.MODULE_ID, "frame-tint", false);
        break;
      }
      case "nothing": {
        await game.settings.set(CONSTANTS.MODULE_ID, "add-frame-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-color-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "add-mask-default", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "enable-default-texture-layer", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "frame-tint", false);
        await game.settings.set(CONSTANTS.MODULE_ID, "default-token-offset", 0);
        await game.settings.set(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", false);
        break;
      }
      // no default
    }
    foundry.utils.debounce(window.location.reload(), 100);
  }
}

export function registerSettings() {

  game.settings.register(CONSTANTS.MODULE_ID, "custom-frames", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(CONSTANTS.MODULE_ID, "custom-masks", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  // dialogues 
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "quick-settings", {
    name: `${CONSTANTS.MODULE_ID}.quick-settings.label`,
    hint: `${CONSTANTS.MODULE_ID}.quick-settings.description`,
    label: `${CONSTANTS.MODULE_ID}.quick-settings.label`,
    scope: "client",
    config: true,
    type: QuickSettings,
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "reset-custom-masks", {
    name: `${CONSTANTS.MODULE_ID}.reset-custom-masks.name`,
    hint: `${CONSTANTS.MODULE_ID}.reset-custom-masks.hint`,
    label: `${CONSTANTS.MODULE_ID}.reset-custom-masks.name`,
    scope: "client",
    config: true,
    type: ResetCustomMasks,
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "reset-custom-frames", {
    name: `${CONSTANTS.MODULE_ID}.reset-custom-frames.name`,
    hint: `${CONSTANTS.MODULE_ID}.reset-custom-frames.hint`,
    label: `${CONSTANTS.MODULE_ID}.reset-custom-frames.name`,
    scope: "client",
    config: true,
    type: ResetCustomFrames,
  });

  // results upload
  game.settings.register(CONSTANTS.MODULE_ID, "image-upload-directory", {
    name: `${CONSTANTS.MODULE_ID}.image-upload-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.image-upload-directory.hint`,
    scope: "world",
    config: true,
    type: String,
    filePicker: "folder",
    default: "[data] tokenizer/pc-images",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "npc-image-upload-directory", {
    name: `${CONSTANTS.MODULE_ID}.npc-image-upload-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.npc-image-upload-directory.hint`,
    scope: "world",
    config: true,
    type: String,
    filePicker: "folder",
    default: "[data] tokenizer/npc-images",
  });


  // some common token settings
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
    default: 1000,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "reset-scaling", {
    name: `${CONSTANTS.MODULE_ID}.reset-scaling.name`,
    hint: `${CONSTANTS.MODULE_ID}.reset-scaling.hint`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  // frames

  game.settings.register(CONSTANTS.MODULE_ID, "add-frame-default", {
    name: `${CONSTANTS.MODULE_ID}.add-frame-default.name`,
    hint: `${CONSTANTS.MODULE_ID}.add-frame-default.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

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
    type: String,
    filePicker: "folder",
    default: "[data] tokenizer/frames",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "frame-tint", {
    name: `${CONSTANTS.MODULE_ID}.frame-tint.name`,
    hint: `${CONSTANTS.MODULE_ID}.frame-tint.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-tint", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-tint.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-frame-tint.hint`,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/plain-marble-frame-grey.png`,
    scope: "world",
    config: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-tint-pc", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-tint.pc`,
    scope: "player",
    config: true,
    type: String,
    default: "grey",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-tint-friendly", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-tint.friendly`,
    scope: "player",
    config: true,
    type: String,
    default: "green",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-tint-neutral", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-tint.neutral`,
    scope: "player",
    config: true,
    type: String,
    default: "blue",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-frame-tint-hostile", {
    name: `${CONSTANTS.MODULE_ID}.default-frame-tint.hostile`,
    scope: "player",
    config: true,
    type: String,
    default: "red",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "auto-apply-dynamic-token-ring", {
    name: `${CONSTANTS.MODULE_ID}.auto-apply-dynamic-token-ring.name`,
    hint: `${CONSTANTS.MODULE_ID}.auto-apply-dynamic-token-ring.hint`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "force-disable-dynamic-token-ring", {
    name: `${CONSTANTS.MODULE_ID}.force-disable-dynamic-token-ring.name`,
    hint: `${CONSTANTS.MODULE_ID}.force-disable-dynamic-token-ring.hint`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
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

  game.settings.register(CONSTANTS.MODULE_ID, "disable-thegreatnacho-frames", {
    name: `${CONSTANTS.MODULE_ID}.disable-thegreatnacho-frames.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  // colour layer
  game.settings.register(CONSTANTS.MODULE_ID, "default-color-layer", {
    name: `${CONSTANTS.MODULE_ID}.default-color-layer.name`,
    scope: "player",
    config: true,
    type: Boolean,
    default: true,
  });


  game.settings.register(CONSTANTS.MODULE_ID, "default-color", {
    name: `${CONSTANTS.MODULE_ID}.default-color.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-color.hint`,
    scope: "player",
    config: true,
    type: String,
    default: "white",
  });

  // Texture Layer

  game.settings.register(CONSTANTS.MODULE_ID, "enable-default-texture-layer", {
    name: `${CONSTANTS.MODULE_ID}.enable-default-texture-layer.name`,
    hint: `${CONSTANTS.MODULE_ID}.enable-default-texture-layer.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-texture-layer", {
    name: `${CONSTANTS.MODULE_ID}.default-texture-layer.name`,
    scope: "world",
    config: true,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/grey-texture.webp`,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-texture-layer-tint", {
    name: `${CONSTANTS.MODULE_ID}.default-texture-layer-tint.name`,
    hint: `${CONSTANTS.MODULE_ID}.default-texture-layer-tint.hint`,
    scope: "player",
    config: true,
    type: String,
    default: "",
  });

  // MASKS
  game.settings.register(CONSTANTS.MODULE_ID, "add-mask-default", {
    name: `${CONSTANTS.MODULE_ID}.add-mask-default.name`,
    hint: `${CONSTANTS.MODULE_ID}.add-mask-default.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "masks-directory", {
    name: `${CONSTANTS.MODULE_ID}.masks-directory.name`,
    hint: `${CONSTANTS.MODULE_ID}.masks-directory.hint`,
    scope: "world",
    config: true,
    type: String,
    filePicker: "folder",
    default: "[data] tokenizer/masks",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "default-mask-layer", {
    name: `${CONSTANTS.MODULE_ID}.default-mask-layer.name`,
    scope: "world",
    config: true,
    type: ImagePicker.Img,
    default: `[data] ${CONSTANTS.PATH}img/dynamic-ring-circle-mask.webp`,
  });

  // MISC

  game.settings.register(CONSTANTS.MODULE_ID, "title-link", {
    name: `${CONSTANTS.MODULE_ID}.title-link.name`,
    hint: `${CONSTANTS.MODULE_ID}.title-link.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disable-player", {
    name: `${CONSTANTS.MODULE_ID}.disable-player.name`,
    hint: `${CONSTANTS.MODULE_ID}.disable-player.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
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

  game.settings.register(CONSTANTS.MODULE_ID, "actor-id-in-name", {
    name: `${CONSTANTS.MODULE_ID}.actor-id-in-name.name`,
    hint: `${CONSTANTS.MODULE_ID}.actor-id-in-name.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "check-for-wildcard-asterisk", {
    name: `${CONSTANTS.MODULE_ID}.check-for-wildcard-asterisk.name`,
    hint: `${CONSTANTS.MODULE_ID}.check-for-wildcard-asterisk.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  logger.debug("Init complete");
}

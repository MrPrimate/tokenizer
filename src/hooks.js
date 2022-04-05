import Tokenizer from "./tokenizer/index.js";
import ImagePicker from "./libs/ImagePicker.js";
import DirectoryPicker from "./libs/DirectoryPicker.js";
import Utils from "./utils.js";
import logger from "./logger.js";

class ResetCustomFrames extends FormApplication {
  static get defaultOptions () {
      const options = super.defaultOptions;
      options.id = "cleanup-custom-frames";
      options.template = "modules/vtta-tokenizer/templates/cleanup.hbs";
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
    game.settings.set("vtta-tokenizer", "custom-frames", []);
  }
}

export function init() {
  game.settings.register("vtta-tokenizer", "default-frame-pc", {
    name: "vtta-tokenizer.default-frame-pc.name",
    hint: "vtta-tokenizer.default-frame-pc.hint",
    type: ImagePicker.Img,
    default: "[data] modules/vtta-tokenizer/img/default-frame-pc.png",
    scope: "world",
    config: true,
  });

  game.settings.register("vtta-tokenizer", "default-frame-npc", {
    name: "vtta-tokenizer.default-frame-npc.name",
    hint: "vtta-tokenizer.default-frame-npc.hint",
    type: ImagePicker.Img,
    default: "[data] modules/vtta-tokenizer/img/default-frame-npc.png",
    scope: "world",
    config: true,
  });

  game.settings.register("vtta-tokenizer", "default-frame-neutral", {
    name: "vtta-tokenizer.default-frame-neutral.name",
    hint: "vtta-tokenizer.default-frame-neutral.hint",
    type: ImagePicker.Img,
    default: "[data] modules/vtta-tokenizer/img/default-frame-npc.png",
    scope: "world",
    config: true,
  });

  game.settings.register("vtta-tokenizer", "frame-directory", {
    name: "vtta-tokenizer.frame-directory.name",
    hint: "vtta-tokenizer.frame-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "",
  });

  game.settings.register("vtta-tokenizer", "add-frame-default", {
    name: "vtta-tokenizer.add-frame-default.name",
    hint: "vtta-tokenizer.add-frame-default.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("vtta-tokenizer", "custom-frames", {
    scope: "client",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.registerMenu("vtta-tokenizer", "reset-custom-frames", {
    name: "Reset Custom Frames?",
    label: "Reset Custom Frames?",
    hint: "Clear Custom Frames List",
    scope: "client",
    config: true,
    type: ResetCustomFrames,
  });

  game.settings.register("vtta-tokenizer", "image-upload-directory", {
    name: "vtta-tokenizer.image-upload-directory.name",
    hint: "vtta-tokenizer.image-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] tokenizer/pc-images",
  });

  game.settings.register("vtta-tokenizer", "npc-image-upload-directory", {
    name: "vtta-tokenizer.npc-image-upload-directory.name",
    hint: "vtta-tokenizer.npc-image-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "[data] tokenizer/npc-images",
  });

  game.settings.register("vtta-tokenizer", "image-save-type", {
    name: "vtta-tokenizer.image-save-type.name",
    hint: "vtta-tokenizer.image-save-type.hint",
    scope: "world",
    config: true,
    default: "webp",
    choices: { "webp": "*.webp", "png": "*.png" },
    type: String,
  });

  game.settings.register("vtta-tokenizer", "token-size", {
    name: "vtta-tokenizer.token-size.name",
    hint: "vtta-tokenizer.token-size.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 400,
  });

  game.settings.register("vtta-tokenizer", "portrait-size", {
    name: "vtta-tokenizer.portrait-size.name",
    hint: "vtta-tokenizer.portrait-size.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 400,
  });

  game.settings.register("vtta-tokenizer", "title-link", {
    name: "vtta-tokenizer.title-link.name",
    hint: "vtta-tokenizer.title-link.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-tokenizer", "disable-avatar-click", {
    name: "vtta-tokenizer.disable-avatar-click.name",
    hint: "vtta-tokenizer.disable-avatar-click.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-tokenizer", "disable-avatar-click-user", {
    name: "vtta-tokenizer.disable-avatar-click-user.name",
    hint: "vtta-tokenizer.disable-avatar-click-user.hint",
    scope: "player",
    config: true,
    type: String,
    choices: {
      "global": "Use global setting",
      "tokenizer": "Tokenizer",
      "default": "Default File Picker"
    },
    default: "global",
  });

  game.settings.register("vtta-tokenizer", "proxy", {
    scope: "world",
    config: false,
    type: String,
    default: "https://images.ddb.mrprimate.co.uk/",
  });

  game.settings.register("vtta-tokenizer", "force-proxy", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-tokenizer", "paste-target", {
    scope: "player",
    config: false,
    type: String,
    default: "token",
  });

  game.settings.register("vtta-tokenizer", "token-only-toggle", {
    name: "vtta-tokenizer.token-only-toggle.name",
    hint: "vtta-tokenizer.token-only-toggle.hint",
    scope: "player",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("vtta-tokenizer", "default-color", {
    name: "vtta-tokenizer.default-color.name",
    hint: "vtta-tokenizer.default-color.hint",
    scope: "world",
    config: true,
    type: String,
    default: "white",
  });

  game.settings.register("vtta-tokenizer", "log-level", {
    name: "vtta-tokenizer.log-level.name",
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

/**
 * Launch the tokenizer
 * Options include
 * name: name to use as part of filename identifier
 * type: pc, npc - defaults to pc
 * avatarFilename: current avatar image - defaults to null/mystery man
 * tokenFilename: current tokenImage - defaults to null/mystery man
 * isWildCard: is wildcard token?
 * any other items needed in callback function, options will be passed to callback, with filenames updated to new references
 * @param {*} options 
 * @param {*} callback function to pass return object to 
 */
function launchTokenizer(options, callback) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize("vtta-tokenizer.requires-upload-permission"));
  }

  game.canvas.layers.forEach((layer) => {
    layer._copy = [];
  });

  logger.debug("Tokenizer options", options);
  const tokenizer = new Tokenizer(options, callback);
  tokenizer.render(true);

}

async function updateActor(tokenizerResponse) {
  logger.debug("Updating Actor, tokenizer data", tokenizerResponse);

  const dateTag = `${+new Date()}`;

  // updating the avatar filename
  const update = {
    img: tokenizerResponse.avatarFilename + "?" + dateTag,
  };

  // for non-wildcard tokens, we set the token img now
  if (tokenizerResponse.actor.data.token.randomImg) {
    const actorName = tokenizerResponse.actor.name.replace(/[^\w.]/gi, "_").replace(/__+/g, "");
    const options = DirectoryPicker.parse(Utils.getBaseUploadFolder(tokenizerResponse.actor.data.type));

    if (tokenizerResponse.actor.data.token.img.indexOf("*") === -1) {
      // set it to a wildcard we can actually use
      const imageFormat = game.settings.get("vtta-tokenizer", "image-save-type");
      ui.notifications.info("Tokenizer: Wildcarding token image to " + tokenizerResponse.actor.data.token.img);
      update.token = {
        img: `${options.current}/${actorName}.Token-*.${imageFormat}`,
      };
    }
  } else {
    update.token = {
      img: tokenizerResponse.tokenFilename + "?" + dateTag,
    };
  }

  await tokenizerResponse.actor.update(update);
  if (tokenizerResponse.token) {
    tokenizerResponse.token.update(update.token);
  }
}

function tokenizeActor(actor) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize("vtta-tokenizer.requires-upload-permission"));
  }

  const options = {
    actor: actor,
    name: actor.name,
    type: actor.data.type === "character" ? "pc" : "npc",
    disposition: actor.data.token.disposition,
    avatarFilename: actor.data.img,
    tokenFilename: actor.data.token.img,
    isWildCard: actor.data.token.randomImg,
  };

  launchTokenizer(options, updateActor);

}

function tokenizeSceneToken(doc) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize("vtta-tokenizer.requires-upload-permission"));
  }

  const options = {
    actor: doc.actor,
    token: doc.token,
    name: doc.token.name,
    type: doc.actor.data.type === "character" ? "pc" : "npc",
    disposition: doc.token.data.disposition,
    avatarFilename: doc.actor.data.img,
    tokenFilename: doc.token.data.img,
    nameSuffix: `${doc.token.id}`,
  };

  launchTokenizer(options, updateActor);

}

function tokenizeDoc(doc) {
  if (doc.token) {
    tokenizeSceneToken(doc);
  } else {  
    tokenizeActor(doc);
  }
}

async function updateSceneTokenImg(actor) {
  const updates = await Promise.all(actor.getActiveTokens().map(async (t) => {
    const newToken = await actor.getTokenData();
    const tokenUpdate = {
        _id: t.id,
        img: newToken.img,
    };
    return tokenUpdate;
  }));
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

export function ready() {
  logger.info("Ready");

  // Set base character upload folder.
  const characterUploads = game.settings.get("vtta-tokenizer", "image-upload-directory");
  const npcUploads = game.settings.get("vtta-tokenizer", "npc-image-upload-directory");

  if (game.user.isGM) {
    DirectoryPicker.verifyPath(DirectoryPicker.parse(characterUploads));
    DirectoryPicker.verifyPath(DirectoryPicker.parse(npcUploads));
    // Update proxy if needed
    const corsProxy = game.settings.get("vtta-tokenizer", "proxy");
    if (corsProxy === "https://london.drop.mrprimate.co.uk/") {
      game.settings.set("vtta-tokenizer", "proxy", "https://images.ddb.mrprimate.co.uk/");
    }
  }

  const titleLink = game.settings.get("vtta-tokenizer", "title-link");

  if (characterUploads != "" && npcUploads == "") game.settings.set("vtta-tokenizer", "npc-image-upload-directory", characterUploads);

  let sheetNames = Object.values(CONFIG.Actor.sheetClasses)
    .reduce((arr, classes) => {
      return arr.concat(Object.values(classes).map((c) => c.cls));
    }, [])
    .map((cls) => cls.name);

  // register tokenizer on all character (npc and pc) sheets
  sheetNames.forEach((sheetName) => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      if (game.user) {
        const version = game.version ?? game.data.version;
        const doc = isNewerVersion(version, "0.8.2") 
        // is this token on a scene, if so we need to handle updates differently
          ? (app.token) ? app : app.document
          : app.entity;

        if (titleLink) {
          const button = $(`<a class="header-button vtta-tokenizer" id="vtta-tokenizer-button" title="Tokenizer"><i class="far fa-user-circle"></i> Tokenizer</a>`);
          html.closest('.app').find('#vtta-tokenizer-button').remove();
          let titleElement = html.closest('.app').find('.window-title');
          if (!app._minimized) button.insertAfter(titleElement);

          button.click((event) => {
            event.preventDefault();
            tokenizeDoc(doc);
          });
        }

        // const SUPPORTED_PROFILE_IMAGE_CLASSES = ["sheet-profile", "profile", "profile-img", "player-image"];
        const disableAvatarClickGlobal = game.settings.get("vtta-tokenizer", "disable-avatar-click");
        const disableAvatarClickUser = game.settings.get("vtta-tokenizer", "disable-avatar-click-user");
        const disableAvatarClick = disableAvatarClickUser === "global"
          ? disableAvatarClickGlobal
          : disableAvatarClickUser === "default"
            ? true
            : false;

        $(html)
        // .find(SUPPORTED_PROFILE_IMAGE_CLASSES.map((cls) => `img.${cls}`).join(", "))
        .find(`[data-edit=img]`)
        .each((index, element) => {
          // deactivating the original FilePicker click
          $(element).off("click");

          // replace it with Tokenizer OR FilePicker click
          $(element).on("click", (event) => {

            const launchTokenizer =
              (!disableAvatarClick && !event.shiftKey) || // avatar click not disabled, and not shift key
              (disableAvatarClick && event.shiftKey); // avatar click disabled, and shift key

            if (launchTokenizer) {
              event.stopPropagation();
              tokenizeDoc(doc);
              event.preventDefault();
            } else {
              // showing the filepicker
              new FilePicker({
                type: "image",
                current: data.actor.data.img,
                callback: (path) => {
                  event.currentTarget.src = path;
                  app._onSubmit(event);
                },
                top: app.position.top + 40,
                left: app.position.left + 10,
              }).browse(data.actor.data.img);
            }
          });
        });
        
      }
    });
  });

  window.Tokenizer = {
    launch: launchTokenizer,
    launchTokenizer,
    tokenizeActor: tokenizeActor,
    tokenizeSceneToken: tokenizeSceneToken,
    tokenizeDoc: tokenizeDoc,
    updateSceneTokenImg,
  };
  
}

Hooks.on('getActorDirectoryEntryContext', (html, entryOptions) => {
  entryOptions.push({
    name: "Tokenizer",
    callback: (li) => {
      const docId = $(li).attr("data-document-id")
        ? $(li).attr("data-document-id")
        : $(li).attr("data-actor-id")
          ? $(li).attr("data-actor-id")
          : $(li).attr("data-entity-id");
      if (docId) {
        const doc = game.actors.get(docId);
        logger.debug(`Tokenizing ${doc.name}`);
        tokenizeActor(doc);
      }
    },
    icon: '<i class="fas fa-user-circle"></i>',
    condition: () => {
      return game.user.can("FILES_UPLOAD");
    }
  });

  entryOptions.push({
    name: "Apply Prototype Token to Scene Tokens",
    callback: (li) => {
      const docId = $(li).attr("data-document-id")
        ? $(li).attr("data-document-id")
        : $(li).attr("data-actor-id")
          ? $(li).attr("data-actor-id")
          : $(li).attr("data-entity-id");
      if (docId) {
        const doc = game.actors.get(docId);
        logger.debug(`Tokenizing ${doc.name} scene tokens`);
        updateSceneTokenImg(doc);
      }
    },
    icon: '<i class="fas fa-user-circle"></i>',
    condition: () => {
      return game.user.can("FILES_UPLOAD");
    }
  });
});

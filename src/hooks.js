import Tokenizer from "./tokenizer/Tokenizer.js";
import DirectoryPicker from "./libs/DirectoryPicker.js";
import Utils from "./libs/Utils.js";
import logger from "./libs/logger.js";
import View from "./tokenizer/View.js";
import AutoTokenize from "./tokenizer/AutoTokenize.js";
import CONSTANTS from "./constants.js";
import { registerSettings } from "./settings.js";

export function init() {
  registerSettings();
}

function getDataEditField() {
  let dataEditField;
  switch (game.system.id) {
    case "yzecoriolis":
      dataEditField = "system.keyArt";
      break;
    default:
      dataEditField = "img";
  }
  return dataEditField;
}

function getAvatarPath(actor) {
  const key = getDataEditField();
  return getProperty(actor, key);
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
    ui.notifications.warn(game.i18n.localize(`${CONSTANTS.MODULE_ID}.requires-upload-permission`));
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
  const update = {};
  const avatarKey = getDataEditField(tokenizerResponse.actor);
  update[avatarKey] = tokenizerResponse.avatarFilename.split("?")[0] + "?" + dateTag;

  if (!tokenizerResponse.actor.prototypeToken.randomImg) {
    // for non-wildcard tokens, we set the token img now
    const tokenPath = tokenizerResponse.tokenFilename.split("?")[0] + "?" + dateTag;
    setProperty(update, "prototypeToken.texture.src", tokenPath);
  } else if (tokenizerResponse.actor.prototypeToken.texture.src.indexOf("*") === -1) {
    // if it is a wildcard and it isn't get like one, we change that
    const actorName = tokenizerResponse.actor.name.replace(/[^\w.]/gi, "_").replace(/__+/g, "");
    const options = DirectoryPicker.parse(tokenizerResponse.tokenUploadDirectory);

    // set it to a wildcard we can actually use
    const imageFormat = game.settings.get(CONSTANTS.MODULE_ID, "image-save-type");
    ui.notifications.info("Tokenizer: Wildcarding token image to " + tokenizerResponse.actor.prototypeToken.texture.src);
    update.token = {
      img: `${options.current}/${actorName}.Token-*.${imageFormat}`,
    };

  } 

  logger.debug("Updating with", update);
  await tokenizerResponse.actor.update(update);
  // if there is a scene token, lets update it
  if (tokenizerResponse.token) {
    tokenizerResponse.token.update(update.prototypeToken);
  }
}

function tokenizeActor(actor) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize(`${CONSTANTS.MODULE_ID}.requires-upload-permission`), { permanent: true });
  }

  const options = {
    actor: actor,
    name: actor.name,
    type: actor.type === "character" ? "pc" : "npc",
    disposition: actor.prototypeToken.disposition,
    avatarFilename: getAvatarPath(actor),
    tokenFilename: actor.prototypeToken.texture.src,
    isWildCard: actor.prototypeToken.randomImg,
  };

  launchTokenizer(options, updateActor);

}

function tokenizeSceneToken(doc) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize(`${CONSTANTS.MODULE_ID}.requires-upload-permission`), { permanent: true });
  }

  const options = {
    actor: doc.actor,
    token: doc.token,
    name: doc.token.name,
    type: doc.actor.type === "character" ? "pc" : "npc",
    disposition: doc.token.disposition,
    avatarFilename: getAvatarPath(doc.actor),
    tokenFilename: doc.token.texture.src,
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
    const newToken = await actor.getTokenDocument();
    const tokenUpdate = {
      _id: t.id,
      "texture.src": newToken.texture.src,
    };
    return tokenUpdate;
  }));
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

export async function autoToken(actor, options) {
  const defaultOptions = {
    actor: actor,
    name: actor.name,
    type: actor.type === "character" ? "pc" : "npc",
    disposition: actor.prototypeToken.disposition,
    avatarFilename: getAvatarPath(actor),
    tokenFilename: actor.prototypeToken.texture.src,
    isWildCard: actor.prototypeToken.randomImg,
    auto: true,
    updateActor: true,
    // tokenOffset: { position: { x: -35, y: -35 } },
  };
  const mergedOptions = mergeObject(defaultOptions, options);
  const tokenizer = new Tokenizer(mergedOptions, updateActor);

  // create mock elements to generate images in
  const tokenizerHtml = `<div class="token" id="tokenizer-token-parent"><h1>Token</h1><div class="view" id="tokenizer-token"></div>`;
  let doc = Utils.htmlToDoc(tokenizerHtml);
  let tokenView = doc.querySelector(".token > .view");
  
  // get the target filename for the token
  const nameSuffix = tokenizer.tokenOptions.nameSuffix ? tokenizer.tokenOptions.nameSuffix : "";
  const targetFilename = await tokenizer._getFilename("Token", nameSuffix);
  tokenizer.tokenFileName = targetFilename;

  // create a Token View
  tokenizer.Token = new View(game.settings.get(CONSTANTS.MODULE_ID, "token-size"), tokenView);
  // Add the actor image and frame to the token view
  await tokenizer._initToken(tokenizer.tokenOptions.tokenFilename);
  // upload result to foundry
  const dataResult = await tokenizer.Token.get("blob");
  await tokenizer.updateToken(dataResult);
  // update actor
  if (mergedOptions.updateActor) {
    await updateActor(tokenizer.tokenOptions);
  }
  return tokenizer.tokenOptions.tokenFilename;
}

function fixUploadLocation() {
  // Set base character upload folder.
  const characterUploads = game.settings.get(CONSTANTS.MODULE_ID, "image-upload-directory");
  const npcUploads = game.settings.get(CONSTANTS.MODULE_ID, "npc-image-upload-directory");

  if (game.user.isGM) {
    DirectoryPicker.verifyPath(DirectoryPicker.parse(characterUploads));
    DirectoryPicker.verifyPath(DirectoryPicker.parse(npcUploads));
    // Update proxy if needed
    const corsProxy = game.settings.get(CONSTANTS.MODULE_ID, "proxy");
    if (corsProxy === "https://london.drop.mrprimate.co.uk/") {
      game.settings.set(CONSTANTS.MODULE_ID, "proxy", "https://images.ddb.mrprimate.co.uk/");
    }
  }

  if (characterUploads != "" && npcUploads == "") game.settings.set(CONSTANTS.MODULE_ID, "npc-image-upload-directory", characterUploads);

}

function linkSheets() {
  const titleLink = game.settings.get(CONSTANTS.MODULE_ID, "title-link");

  let sheetNames = Object.values(CONFIG.Actor.sheetClasses)
    .reduce((arr, classes) => {
      return arr.concat(Object.values(classes).map((c) => c.cls));
    }, [])
    .map((cls) => cls.name);

  // register tokenizer on all character (npc and pc) sheets
  sheetNames.forEach((sheetName) => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      if (game.user) {
        const doc = (app.token) ? app : app.document;

        if (titleLink) {
          const button = $(`<a class="header-button ${CONSTANTS.MODULE_ID}" id="${CONSTANTS.MODULE_ID}-button" title="Tokenizer"><i class="far fa-user-circle"></i> Tokenizer</a>`);
          html.closest('.app').find(`#${CONSTANTS.MODULE_ID}-button`).remove();
          let titleElement = html.closest('.app').find('.window-title');
          if (!app._minimized) button.insertAfter(titleElement);

          button.click((event) => {
            event.preventDefault();
            tokenizeDoc(doc);
          });
        }

        const disableAvatarClickGlobal = game.settings.get(CONSTANTS.MODULE_ID, "disable-avatar-click");
        const disableAvatarClickUser = game.settings.get(CONSTANTS.MODULE_ID, "disable-avatar-click-user");
        const disableAvatarClick = disableAvatarClickUser === "global"
          ? disableAvatarClickGlobal
          : disableAvatarClickUser === "default";

        const dataEditField = getDataEditField();
        $(html)
        .find(`[data-edit="${dataEditField}"]`)
        .each((index, element) => {
          // deactivating the original FilePicker click
          $(element).off("click");

          // replace it with Tokenizer OR FilePicker click
          $(element).on("click", (event) => {

            const launchTokenizer
              = (!disableAvatarClick && !event.shiftKey) // avatar click not disabled, and not shift key
              || (disableAvatarClick && event.shiftKey); // avatar click disabled, and shift key

            if (launchTokenizer) {
              event.stopPropagation();
              tokenizeDoc(doc);
              event.preventDefault();
            } else {
              // showing the filepicker
              new FilePicker({
                type: "image",
                current: data.actor[dataEditField],
                callback: (path) => {
                  event.currentTarget.src = path;
                  app._onSubmit(event);
                },
                top: app.position.top + 40,
                left: app.position.left + 10,
              }).browse(data.actor[dataEditField]);
            }
          });
        });
        
      }
    });
  });
}

function exposeAPI() {
  const API = {
    launch: launchTokenizer,
    launchTokenizer,
    tokenizeActor,
    tokenizeSceneToken,
    tokenizeDoc,
    updateSceneTokenImg,
    autoToken,
  };

  window.Tokenizer = API;
  game.modules.get(CONSTANTS.MODULE_ID).api = API;
}

export function ready() {
  logger.info("Ready Hook Called");
  fixUploadLocation();
  linkSheets();
  exposeAPI();
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
        logger.debug(`Updating ${doc.name} scene tokens for:`, doc);
        updateSceneTokenImg(doc);
      }
    },
    icon: '<i class="fas fa-user-circle"></i>',
    condition: () => {
      return game.user.can("FILES_UPLOAD");
    }
  });
});

Hooks.on("getCompendiumDirectoryEntryContext", (html, contextOptions) => {
  contextOptions.push({
    name: `${CONSTANTS.MODULE_ID}.compendium.auto-tokenize`,
    callback: (li) => {
      const pack = $(li).attr("data-pack");
      const compendium = game.packs.get(pack);
      if (compendium) {
        const auto = new AutoTokenize(compendium);
        auto.render(true);
      }
    },
    condition: (li) => {
      const pack = $(li).attr("data-pack");
      const compendium = game.packs.get(pack);
      const isActor = compendium.metadata.type === "Actor";
      return isActor;
    },
    icon: '<i class="fas fa-user-circle"></i>',
  });
});

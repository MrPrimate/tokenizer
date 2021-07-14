import Tokenizer from "./tokenizer/index.js";
import ImagePicker from "./libs/ImagePicker.js";
import DirectoryPicker from "./libs/DirectoryPicker.js";


export function init() {
  console.log("VTTA Tokenizer | Init");

  game.settings.register("vtta-tokenizer", "default-frame-pc", {
    name: "vtta-tokenizer.default-frame-pc.name",
    hint: "vtta-tokenizer.default-frame-pc.hint",
    type: ImagePicker.Img,
    default: "modules/vtta-tokenizer/img/default-frame-pc.png",
    scope: "world",
    config: true,
  });

  game.settings.register("vtta-tokenizer", "default-frame-npc", {
    name: "vtta-tokenizer.default-frame-npc.name",
    hint: "vtta-tokenizer.default-frame-npc.hint",
    type: ImagePicker.Img,
    default: "modules/vtta-tokenizer/img/default-frame-npc.png",
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

  game.settings.register("vtta-tokenizer", "image-upload-directory", {
    name: "vtta-tokenizer.image-upload-directory.name",
    hint: "vtta-tokenizer.image-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "",
  });

  game.settings.register("vtta-tokenizer", "npc-image-upload-directory", {
    name: "vtta-tokenizer.npc-image-upload-directory.name",
    hint: "vtta-tokenizer.npc-image-upload-directory.hint",
    scope: "world",
    config: true,
    type: DirectoryPicker.Directory,
    default: "",
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

  game.settings.register("vtta-tokenizer", "proxy", {
    scope: "world",
    config: false,
    type: String,
    default: "https://london.drop.mrprimate.co.uk/",
  });

  game.settings.register("vtta-tokenizer", "default-color", {
    name: "vtta-tokenizer.default-color.name",
    hint: "vtta-tokenizer.default-color.hint",
    scope: "world",
    config: true,
    type: String,
    default: "white",
  });
}

function launchTokenizer(actor, callback) {
  if (!game.user.can("FILES_UPLOAD")) {
    ui.notifications.warn(game.i18n.localize("vtta-tokenizer.requires-upload-permission"));
  }

  const tokenizer = new Tokenizer({}, actor, callback);
  tokenizer.render(true);

}

export function ready() {
  console.log("Tokenizer | Ready");

  // check for failed registered settings
  let hasErrors = false;

  const titleLink = game.settings.get("vtta-tokenizer", "title-link");

  // Set base character upload folder.
  const characterUploads = game.settings.get("vtta-tokenizer", "image-upload-directory");
  const npcUploads = game.settings.get("vtta-tokenizer", "npc-image-upload-directory");
  if (characterUploads != "" && npcUploads == "") game.settings.set("vtta-tokenizer", "npc-image-upload-directory", characterUploads);

  for (let s of game.settings.settings.values()) {
    if (s.module !== "vtta-tokenizer") continue;
    try {
      const setting = game.settings.get(s.module, s.key);
      if(setting == "null" && key === 'image-upload-directory') throw new Error()
    } catch (err) {
      hasErrors = true;
      ui.notifications.info(`[${s.module}] Erroneous module settings found, resetting to default.`);
      game.settings.set(s.module, s.key, s.default);
    }
  }

  if (hasErrors) {
    ui.notifications.warn("Please review the module settings to re-adjust them to your desired configuration.");
  }

  let sheetNames = Object.values(CONFIG.Actor.sheetClasses)
    .reduce((arr, classes) => {
      return arr.concat(Object.values(classes).map(c => c.cls));
    }, [])
    .map(cls => cls.name);

  // register tokenizer on all character (npc and pc) sheets
  sheetNames.forEach(sheetName => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      if (game.user) {
        const doc = isNewerVersion(game.data.version, "0.8.2") ? app.document : app.entity;

        if (titleLink) {
          const button = $(`<a class="header-button vtta-tokenizer" id="vtta-tokenizer-button" title="Tokenizer"><i class="far fa-user-circle"></i> Tokenizer</a>`);
          html.closest('.app').find('#vtta-tokenizer-button').remove();
          let titleElement = html.closest('.app').find('.window-title');
          if (!app._minimized) button.insertAfter(titleElement);

          button.click((event) => {
            event.preventDefault();
            launchTokenizer(doc);
          });
        }

        const SUPPORTED_PROFILE_IMAGE_CLASSES = ["sheet-profile", "profile", "profile-img", "player-image"];

        $(html)
          .find(SUPPORTED_PROFILE_IMAGE_CLASSES.map(cls => `img.${cls}`).join(", "))
          .each((index, element) => {
            // deactivating the original FilePicker click
            $(element).off("click");

            // replace it with Tokenizer OR FilePicker click
            $(element).on("click", event => {
              if (!event.shiftKey) {
                event.stopPropagation();
                launchTokenizer(doc);
                event.preventDefault();
              } else {
                // showing the filepicker
                new FilePicker({
                  type: "image",
                  current: data.actor.data.img,
                  callback: path => {
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
  };
}

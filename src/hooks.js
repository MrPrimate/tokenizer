import Tokenizer from "./tokenizer/index.js";

import SettingsExtender from "./libs/settingsExtender.js";
SettingsExtender();

export function init() {
  console.log("VTTA Tokenizer | Init");

  game.settings.register("vtta-tokenizer", "default-frame-pc", {
    name: "vtta-tokenizer.default-frame-pc.name",
    hint: "vtta-tokenizer.default-frame-pc.hint",
    type: window.Azzu.SettingsTypes.FilePickerImage,
    default: "/modules/vtta-tokenizer/img/default-frame-pc.png",
    scope: "world",
    config: true
  });

  game.settings.register("vtta-tokenizer", "default-frame-npc", {
    name: "vtta-tokenizer.default-frame-npc.name",
    hint: "vtta-tokenizer.default-frame-npc.hint",
    type: window.Azzu.SettingsTypes.FilePickerImage,
    default: "/modules/vtta-tokenizer/img/default-frame-npc.png",
    scope: "world",
    config: true
  });

  game.settings.register("vtta-tokenizer", "image-upload-directory", {
    name: "vtta-tokenizer.image-upload-directory.name",
    hint: "vtta-tokenizer.image-upload-directory.hint",
    scope: "world",
    config: true,
    //type: String,
    type: window.Azzu.SettingsTypes.DirectoryPicker,
    default: ""
  });

  game.settings.register("vtta-tokenizer", "token-size", {
    name: "vtta-tokenizer.token-size.name",
    hint: "vtta-tokenizer.token-size.hint",
    scope: "world",
    config: true,
    type: Number,
    default: 400
  });
}

export function ready() {
  console.log("VTTA Tokenizer | Ready");

  let sheetNames = Object.values(CONFIG.Actor.sheetClasses)
    .reduce((arr, classes) => {
      return arr.concat(Object.values(classes).map(c => c.cls));
    }, [])
    .map(cls => cls.name);

  // register tokenizer on all character (npc and pc) sheets
  sheetNames.forEach(sheetName => {
    Hooks.on("render" + sheetName, (app, html, data) => {
      if (!game.user.isTrusted) {
        if (!hasShownWarning) {
          hasShownWarning = true;
          ui.notifications.info(
            game.i18n.localize("vtta-tokenizer.ERROR_REQUIRES_TRUSTED_PLAYER")
          );
        }
      } else {
        $(html)
          .find("img.sheet-profile")
          .off("click");

        $(html)
          .find("img.sheet-profile")
          .on("click", event => {
            let tokenizer = new Tokenizer({}, app.entity);
            tokenizer.render(true);
          });

        $(html)
          .find("img.profile")
          .off("click");

        $(html)
          .find("img.profile")
          .on("click", event => {
            let tokenizer = new Tokenizer({}, app.entity);
            tokenizer.render(true);
          });

        $(html)
          .find("img.profile-img")
          .off("click");

        $(html)
          .find("img.profile-img")
          .on("click", event => {
            let tokenizer = new Tokenizer({}, app.entity);
            tokenizer.render(true);
          });
      }
    });
  });
}

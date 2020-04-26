import Utils from "../utils.js";
import View from "./view.js";

export default class Tokenizer extends FormApplication {
  constructor(options, actor) {
    super(options);
    this.actor = actor;
  }
  /**
   * Define default options for the PartySummary application
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "modules/vtta-tokenizer/src/tokenizer/tokenizer.html";
    options.width = 900;
    options.height = "auto";
    options.classes = ["vtta"];
    return options;
  }

  /* -------------------------------------------- */

  getData() {
    return {
      data: this.actor.data,
      canUpload: game.user && game.user.can("FILES_UPLOAD"), //game.user.isTrusted || game.user.isGM,
      canBrowse: game.user && game.user.can("FILES_BROWSE"),
    };
  }

  _updateObject(event, formData) {
    // Update the object this ApplicationForm is based on
    // e.g. this.object.update(formData)

    // upload token and avatar
    let avatarFilename = `${this.actor.data.name}.Avatar.${this.actor._id}.png`;
    let tokenFilename = `${this.actor.data.name}.Token.${this.actor._id}.png`;

    const targetPath = game.settings.get(
      "vtta-tokenizer",
      "image-upload-directory"
    );
    if (this.Token) {
      // get the data
      Promise.all([this.Avatar.get("blob"), this.Token.get("blob")]).then(
        async (dataResults) => {
          avatarFilename = await Utils.uploadToFoundryV2(
            dataResults[0],
            targetPath,
            avatarFilename
          );

          tokenFilename = await Utils.uploadToFoundryV2(
            dataResults[1],
            targetPath,
            tokenFilename
          );

          await this.actor.update({
            img: avatarFilename + "?t=" + new Date().getTime(),
            token: {
              img: tokenFilename + "?t=" + new Date().getTime(),
            },
          });
        }
      );

      // Promise.all([
      //   Utils.uploadToFoundryV2(
      //     this.Avatar.get("blob"),
      //     targetPath,
      //     avatarFilename
      //   ),
      //   Utils.uploadToFoundryV2(
      //     this.Token.get("blob"),
      //     targetPath,
      //     tokenFilename
      //   ),
      // ]).then(async (results) => {
      //   await this.actor.update({
      //     img: results[0] + "?t=" + new Date().getTime(),
      //   });
      //   await this.actor.update({
      //     "token.img": results[1] + "?t=" + new Date().getTime(),
      //   });
      // });
    } else {
      this.Token.get("blob").then((data) => {
        Utils.uploadToFoundryV2(data, targetPath, tokenFilename).then(
          async (img) =>
            await this.actor.update({ img: img + "?t=" + new Date().getTime() })
        );
      });
      // ,
      //   Utils.uploadToFoundry(this.Avatar.get("blob"), avatarFilename).then(
      //     async (img) =>
      //       await this.actor.update({ img: img + "?t=" + new Date().getTime() })
      //   );
    }
  }

  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);

    let avatarView = document.querySelector(".avatar > .view");
    this.Avatar = new View(
      game.settings.get("vtta-tokenizer", "token-size"),
      avatarView
    );
    Utils.download(this.actor.data.img)
      .then((img) => this.Avatar.addImageLayer(img))
      .catch((error) => ui.notifications.error(error));

    let tokenView = document.querySelector(".token > .view");
    if (this.actor.data.token.randomImg) {
      let info = document.createElement("div");
      info.style.color = "red";
      info.style.fontSize = "1.5rem";
      info.style.textAlign = "center";

      info.innerHTML = game.i18n.localize(
        "vtta-tokenizer.ERROR_WILDCARD_IMAGE_SET"
      );
      tokenView.appendChild(info);

      let tokenMenu = document.querySelector(".token .menu");
      tokenMenu.style.visibility = "hidden";
    } else {
      this.Token = new View(
        game.settings.get("vtta-tokenizer", "token-size"),
        tokenView
      );

      // Add the actor image to the token view
      Utils.download(this.actor.data.token.img)
        .then((img) => {
          this.Token.addImageLayer(img);

          // load the default frame, if there is one set
          let type = this.actor.data.type === "character" ? "pc" : "npc";
          let defaultFrame = game.settings
            .get("vtta-tokenizer", "default-frame-" + type)
            .replace(/^\/|\/$/g, "");

          if (defaultFrame && defaultFrame.trim() !== "") {
            let masked = true;
            Utils.download(defaultFrame)
              .then((img) => this.Token.addImageLayer(img, masked))
              .catch((error) => ui.notifications.error(error));
          }
        })
        .catch((error) => ui.notifications.error(error));
    }

    $("#vtta-tokenizer .filePickerTarget").on("change", (event) => {
      let eventTarget =
        event.target == event.currentTarget
          ? event.target
          : event.currentTarget;
      let view =
        eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token;
      let type = eventTarget.dataset.type;

      Utils.download(eventTarget.value)
        .then((img) => view.addImageLayer(img))
        .catch((error) => ui.notifications.error(error));
    });

    $("#vtta-tokenizer button.menu-button").click(async (event) => {
      event.preventDefault();
      let eventTarget =
        event.target == event.currentTarget
          ? event.target
          : event.currentTarget;

      let view =
        eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token;
      let type = eventTarget.dataset.type;

      switch (eventTarget.dataset.type) {
        case "upload":
          Utils.upload().then((img) => view.addImageLayer(img));
          break;
        case "download":
          // show dialog, then download
          let urlPrompt = new Dialog({
            title: "Download from the internet",
            content: `
                      <p>Please provide the URL of your desired image.</p>
                      <form>
                      <div class="form-group">
                         <label>URL</label>
                         <input id="url" type="text" name="url" placeholder="https://" data-dtype="String">
                      </div>
                      </form>`,
            buttons: {
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => console.log("Cancelled"),
              },
              ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: () => {
                  Utils.download($("#url").val())
                    .then((img) => view.addImageLayer(img))
                    .catch((error) => ui.notification.error(error));
                },
              },
            },
          });

          urlPrompt.render(true);

          break;
        case "avatar":
          this.Avatar.get("img").then((img) => view.addImageLayer(img));
          break;
      }
    });
  }
}

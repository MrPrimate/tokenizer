import Utils from "../utils.js";
import View from "./view.js";
import DirectoryPicker from "./../libs/DirectoryPicker.js";

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
    options.classes = ["tokenizer"];
    return options;
  }

  /* -------------------------------------------- */

  async getData() {
    const defaultFrames = [
      {
        key: game.settings.get("vtta-tokenizer", "default-frame-pc").replace(/^\/|\/$/g, ""),
        label: "Default Player Frame",
        selected: false,
      },
      {
        key: game.settings.get("vtta-tokenizer", "default-frame-npc").replace(/^\/|\/$/g, ""),
        label: "Default NPC Frame",
        selected: true,
      }
    ];

    const directoryPath = game.settings.get("vtta-tokenizer", "frame-directory");
    console.debug(`Checking for files in ${directoryPath}...`);
    const dir = DirectoryPicker.parse(directoryPath);
    const fileList = await DirectoryPicker.browse(dir.activeSource, dir.current, { bucket: dir.bucket });

    const folderFrames = fileList.files.map((file) => {
      const labelSplit = file.split("/").pop().trim();
      const label = labelSplit.replace(/^frame-/, "").replace(/[-_]/g, " ");
      return {
        key: file,
        label: Utils.titleString(label).split(".")[0],
        selected: false,
      }
    });

    const frames = defaultFrames.concat(folderFrames);

    return {
      data: this.actor.data,
      canUpload: game.user && game.user.can("FILES_UPLOAD"), //game.user.isTrusted || game.user.isGM,
      canBrowse: game.user && game.user.can("FILES_BROWSE"),
      tokenVariantsEnabled: game.user && game.user.can("FILES_BROWSE") && Boolean(game.TokenVariants),
      frames: frames,
    };
  }

  async _getFilename(suffix = "Avatar") {
    const isWildCard = () => this.actor.data.token.randomImg;
    const actorName = await Utils.makeSlug(this.actor);
    const imageFormat = game.settings.get("vtta-tokenizer", "image-save-type");

    if (suffix === "Token" && isWildCard()) {
      const options = DirectoryPicker.parse(Utils.getBaseUploadFolder(this.actor.data.type));

      let tokenWildcard = this.actor.data.token.img;

      if (tokenWildcard.indexOf("*") === -1) {
        // set it to a wildcard we can actually use
        tokenWildcard = `${options.current}/${actorName}.Token-*.${imageFormat}`;
      }
      // get the next free index
      const browser = await FilePicker.browse(options.activeSource, tokenWildcard, {
        wildcard: true,
      });
      let count = 0;
      let targetFilename = "";
      do {
        count++;
        const index = count.toString().padStart(3, "0");
        targetFilename = tokenWildcard.replace(/\*/g, index);
      } while (browser.files.find(filename => filename === targetFilename) !== undefined);

      return targetFilename;
    }
    return `${actorName}.${suffix}.${imageFormat}`;
  }

  _updateObject(event, formData) {
    // Update the object this ApplicationForm is based on
    // e.g. this.object.update(formData)

    const imageFormat = game.settings.get("vtta-tokenizer", "image-save-type");

    // upload token and avatar
    let avatarFilename = formData.targetAvatarFilename;
    let tokenFilename = formData.targetTokenFilename;

    // get the data
    Promise.all([this.Avatar.get("blob"), this.Token.get("blob")]).then(async dataResults => {
      avatarFilename = await Utils.uploadToFoundry(dataResults[0], avatarFilename, this.actor.data.type);
      tokenFilename = await Utils.uploadToFoundry(dataResults[1], tokenFilename, this.actor.data.type);

      // updating the avatar filename
      const update = {
        img: avatarFilename + "?" + +new Date(),
      };

      // for non-wildcard tokens, we set the token img now
      if (this.actor.data.token.randomImg) {
        const actorName = this.actor.name.replace(/[^\w.]/gi, "_").replace(/__+/g, "");
        const options = DirectoryPicker.parse(Utils.getBaseUploadFolder(this.actor.data.type));

        if (this.actor.data.token.img.indexOf("*") === -1) {
          // set it to a wildcard we can actually use
          ui.notifications.info("Tokenizer: Wildcarding token image to " + this.actor.data.token.img);
          update.token = {
            img: `${options.current}/${actorName}.Token-*.${imageFormat}`,
          };
        }
      } else {
        update.token = {
          img: tokenFilename + "?" + +new Date(),
        };
      }

      await this.actor.update(update);
    });
  }

  /* -------------------------------------------- */

  async _initAvatar(html, inputUrl) {
    const url = inputUrl ?? CONST.DEFAULT_TOKEN ?? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const avatarView = document.querySelector(".avatar > .view");
    if (this.Avatar) {
      this.Avatar.canvas.remove()
      this.Avatar.stage.remove()
      this.Avatar.controlsArea.remove()
      this.Avatar.menu.remove()
    }
    this.Avatar = null
    try {
      const img = await Utils.download(url)
      const MAX_DIMENSION = Math.max(img.naturalHeight, img.naturalWidth, game.settings.get("vtta-tokenizer", "portrait-size"));
      console.log("Setting Avatar dimensions to " + MAX_DIMENSION + "x" + MAX_DIMENSION);
      this.Avatar = new View(MAX_DIMENSION, avatarView);
      this.Avatar.addImageLayer(img);

      // Setting the height of the form to the desired auto height
      $(html).parent().parent().css("height", "auto");
    } catch (error) {
      if (inputUrl) {
        ui.notifications.error(`Failed to load original image "${url}". File has possibly been deleted. Falling back to default.`)
        await this._initAvatar(html)
      } else {
        ui.notifications.error('Failed to load fallback image.')
      }
    }
  }

  activateListeners(html) {
    this._initAvatar(html, this.actor.img)

    let tokenView = document.querySelector(".token > .view");

    // get the target filename for the avatar
    this._getFilename("Avatar").then(targetFilename => {
      $('input[name="targetAvatarFilename"]').val(targetFilename);
    });
    // get the target filename for the token
    this._getFilename("Token").then(targetFilename => {
      $('span[name="targetFilename"]').text(targetFilename);
      $('input[name="targetTokenFilename"]').val(targetFilename);
    });

    if (this.actor.data.token.randomImg) {
      $("#vtta-tokenizer div.token > h1").text("Token (Wildcard)");
      this.Token = new View(game.settings.get("vtta-tokenizer", "token-size"), tokenView);
      // load the default frame, if there is one set
      this._setTokenFrame();
    } else {
      this.Token = new View(game.settings.get("vtta-tokenizer", "token-size"), tokenView);

      // Add the actor image to the token view
      this._initToken(this.actor.data.token.img);
    }

    $("#vtta-tokenizer .filePickerTarget").on("change", event => {
      let eventTarget = event.target == event.currentTarget ? event.target : event.currentTarget;
      let view = eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token;
      let type = eventTarget.dataset.type;

      Utils.download(eventTarget.value)
        .then(img => view.addImageLayer(img))
        .catch(error => ui.notifications.error(error));
    });

    $("#vtta-tokenizer button.menu-button").click(async event => {
      event.preventDefault();
      let eventTarget = event.target == event.currentTarget ? event.target : event.currentTarget;
      let view = eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token

      switch (eventTarget.dataset.type) {
        case "upload":
          const img = await Utils.upload()
          view.addImageLayer(img);
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
                    .then(img => view.addImageLayer(img))
                    .catch(error => ui.notification.error(error));
                },
              },
            },
          });

          urlPrompt.render(true);

          break;
        case "avatar":
          this.Avatar.get("img").then(img => view.addImageLayer(img));
          break;
        case "tokenVariants":
          game.TokenVariants.displayArtSelect(this.actor.name,
            (imgSrc) => Utils.download(imgSrc).then(img => view.addImageLayer(img)),
            eventTarget.dataset.target === "avatar" ? "portrait" : "token");
          break;
        case "frame":
          const frame = document.getElementById("frame-selector").value;
          this._setTokenFrame(frame);
          break;
      }
    });

    super.activateListeners(html);
  }

  async _initToken(src) {
    let imgSrc = src ?? CONST.DEFAULT_TOKEN
    try {
      const img = await Utils.download(imgSrc)
      this.Token.addImageLayer(img);
      if (game.settings.get("vtta-tokenizer", "add-frame-default")) {
        await this._setTokenFrame();
      } 
    } catch (error) {
      if (!src || src === CONST.DEFAULT_TOKEN) {
        console.error(`Failed to load fallback token: "${imgSrc}"`)
      }
      else {
        ui.notifications.error(`Failed to load token: "${imgSrc}", falling back to "${CONST.DEFAULT_TOKEN}"`)
        console.error(error)
        await this._initToken()
      }
    }
  }

  async _setTokenFrame(fileName) {
    // load the default frame, if there is one set
    const type = this.actor.data.type === "character" ? "pc" : "npc";
    const isDefault = game.settings.get("vtta-tokenizer", `default-frame-pc`).replace(/^\/|\/$/g, "") ||
      fileName != game.settings.get("vtta-tokenizer", `default-frame-npc`).replace(/^\/|\/$/g, "");
    const framePath = fileName && !isDefault
      ? `${game.settings.get("vtta-tokenizer", "frame-directory")}/${fileName}`
      : fileName && isDefault
        ? fileName.replace(/^\/|\/$/g, "")
        : game.settings.get("vtta-tokenizer", `default-frame-${type}`).replace(/^\/|\/$/g, "");

    if (framePath && framePath.trim() !== "") {
      const options = DirectoryPicker.parse(framePath);
      try {
        const img = await Utils.download(options.current);
        this.Token.addImageLayer(img, true);
      } catch (error) {
        ui.notifications.error(`Failed to load frame: "${options.current}"`);
      }
    }
  }

}

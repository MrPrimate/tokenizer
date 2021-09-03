import Utils from "../utils.js";
import logger from "../logger.js";
import View from "./view.js";
import DirectoryPicker from "./../libs/DirectoryPicker.js";

export default class Tokenizer extends FormApplication {

  //  Options include
  //  name: name to use as part of filename identifier
  //  type: pc, npc
  //  avatarFilename: current avatar image - defaults to null/mystery man
  //  tokenFilename: current tokenImage - defaults to null/mystery man
  //  targetFolder: folder to target, otherwise uses defaults, wildcard use folder derived from wildcard path
  //  isWildCard: is wildcard token?
  //  any other items needed in callback function, options will be passed to callback, with filenames updated to new references
  //
  constructor(options, callback) {
    super({});
    this.tokenOptions = options;
    this.callback = callback;
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
    logger.debug(`Checking for files in ${directoryPath}...`);
    const dir = DirectoryPicker.parse(directoryPath);
    const fileList = await DirectoryPicker.browse(dir.activeSource, dir.current, { bucket: dir.bucket });

    const folderFrames = fileList.files.map((file) => {
      const labelSplit = file.split("/").pop().trim();
      const label = labelSplit.replace(/^frame-/, "").replace(/[-_]/g, " ");
      return {
        key: file,
        label: Utils.titleString(label).split(".")[0],
        selected: false,
      };
    });

    const frames = defaultFrames.concat(folderFrames);
    const pasteTarget = game.settings.get("vtta-tokenizer", "paste-target");
    const pasteTargetName = Utils.titleString(pasteTarget);

    return {
      options: this.tokenOptions,
      canUpload: game.user && game.user.can("FILES_UPLOAD"), // game.user.isTrusted || game.user.isGM,
      canBrowse: game.user && game.user.can("FILES_BROWSE"),
      tokenVariantsEnabled: game.user && game.user.can("FILES_BROWSE") && Boolean(game.TokenVariants),
      frames: frames,
      pasteTarget: pasteTarget,
      pasteTargetName: pasteTargetName,
    };
  }

  getWildCardPath() {
    if (!this.tokenOptions.isWildCard) return undefined;
    let wildCardPath = Utils.getBaseUploadFolder(this.tokenOptions.type);
    if (this.tokenOptions.tokenFilename) {
      let wildCardTokenPathArray = this.tokenOptions.tokenFilename.split("/");
      wildCardTokenPathArray.pop();
      wildCardPath = wildCardTokenPathArray.join("/");
    }
    return wildCardPath;
  }

  getOverRidePath(isToken) {
    let path;
    if (isToken && this.tokenOptions.isWildCard) {
      path = this.getWildCardPath();
    }
    if (!path) {
      path = this.tokenOptions.targetFolder
        ? this.tokenOptions.targetFolder
        : undefined;
    }
    return path;
  }

  async _getFilename(suffix = "Avatar", postfix = "") {
    const actorName = await Utils.makeSlug(this.tokenOptions.name);
    const imageFormat = game.settings.get("vtta-tokenizer", "image-save-type");

    if (suffix === "Token" && this.tokenOptions.isWildCard) {
      // for wildcards we respect the current path of the existing/provided tokenpath
      const wildCardPath = this.getWildCardPath();
      const dirOptions = DirectoryPicker.parse(wildCardPath);
      const tokenWildcard = this.tokenOptions.tokenFilename.indexOf("*") === -1
        // set it to a wildcard we can actually use
        ? `${dirOptions.current}/${actorName}.Token-*.${imageFormat}`
        : this.tokenOptions.tokenFilename;

      const browser = await FilePicker.browse(dirOptions.activeSource, tokenWildcard, {
        wildcard: true,
      });

      const newCount = browser.files.length + 1;
      const num = newCount.toString().padStart(3, "0");
      const targetFilename = tokenWildcard.replace(/\*/g, num).split("/").pop();

      return targetFilename;
    }
    return `${actorName}.${suffix}${postfix}.${imageFormat}`;
  }

  _updateObject(event, formData) {
    // Update the object this ApplicationForm is based on
    // e.g. this.object.update(formData)

    // upload token and avatar
    let avatarFilename = formData.targetAvatarFilename;
    let tokenFilename = formData.targetTokenFilename;

    // get the data
    Promise.all([this.Avatar.get("blob"), this.Token.get("blob")]).then(async (dataResults) => {
      this.tokenOptions.avatarFilename = await Utils.uploadToFoundry(dataResults[0], avatarFilename, this.tokenOptions.type, this.getOverRidePath(false));
      this.tokenOptions.tokenFilename = await Utils.uploadToFoundry(dataResults[1], tokenFilename, this.tokenOptions.type, this.getOverRidePath(true));

      this.callback(this.tokenOptions);
    });
  }

  /* -------------------------------------------- */

  async _initAvatar(html, inputUrl) {
    const url = inputUrl ?? CONST.DEFAULT_TOKEN ?? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const avatarView = document.querySelector(".avatar > .view");
    if (this.Avatar) {
      this.Avatar.canvas.remove();
      this.Avatar.stage.remove();
      this.Avatar.controlsArea.remove();
      this.Avatar.menu.remove();
    }
    this.Avatar = null;
    try {
      const img = await Utils.download(url);
      const MAX_DIMENSION = Math.max(img.naturalHeight, img.naturalWidth, game.settings.get("vtta-tokenizer", "portrait-size"));
      logger.debug("Setting Avatar dimensions to " + MAX_DIMENSION + "x" + MAX_DIMENSION);
      this.Avatar = new View(MAX_DIMENSION, avatarView);
      this.Avatar.addImageLayer(img);

      // Setting the height of the form to the desired auto height
      $(html).parent().parent().css("height", "auto");
    } catch (error) {
      if (inputUrl) {
        ui.notifications.error(`Failed to load original image "${url}". File has possibly been deleted. Falling back to default.`);
        await this._initAvatar(html);
      } else {
        ui.notifications.error('Failed to load fallback image.');
      }
    }
  }

  activateListeners(html) {
    this.loadImages(html);

    $("#vtta-tokenizer .filePickerTarget").on("change", (event) => {
      const eventTarget = event.target == event.currentTarget ? event.target : event.currentTarget;
      const view = eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token;

      Utils.download(eventTarget.value)
        .then((img) => view.addImageLayer(img))
        .catch((error) => ui.notifications.error(error));
    });

    $("#vtta-tokenizer button.menu-button").click(async (event) => {
      event.preventDefault();
      const eventTarget = event.target == event.currentTarget ? event.target : event.currentTarget;
      const view = eventTarget.dataset.target === "avatar" ? this.Avatar : this.Token;

      switch (eventTarget.dataset.type) {
        case "upload": {
          const img = await Utils.upload();
          view.addImageLayer(img);
          break;
        }
        case "download": {
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
                callback: () => logger.debug("Cancelled"),
              },
              ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: () => {
                  Utils.download($("#url").val())
                    .then((img) => view.addImageLayer(img))
                    .catch((error) => {
                      logger.error("Error fetching image", error);
                      ui.notification.error(error);
                    });
                },
              },
            },
          });

          urlPrompt.render(true);

          break;
        }
        case "avatar": {
          this.Avatar.get("img").then((img) => view.addImageLayer(img));
          break;
        }
        case "tokenVariants": {
          game.TokenVariants.displayArtSelect(this.tokenOptions.name,
            (imgSrc) => Utils.download(imgSrc).then((img) => view.addImageLayer(img)),
            eventTarget.dataset.target === "avatar" ? "portrait" : "token");
          break;
        }
        case "frame": {
          const frame = document.getElementById("frame-selector").value;
          this._setTokenFrame(frame);
          break;
        }
        case "paste-toggle-token": {
          const toggle = document.getElementById("paste-toggle");
          toggle.setAttribute("data-type", "paste-toggle-avatar");
          toggle.innerHTML = '<i class="fas fa-clipboard"></i> Avatar';
          game.settings.set("vtta-tokenizer", "paste-target", "avatar");
          break;
        }
        case "paste-toggle-avatar": {
          const toggle = document.getElementById("paste-toggle");
          toggle.setAttribute("data-type", "paste-toggle-token");
          toggle.innerHTML = '<i class="fas fa-clipboard"></i> Token';
          game.settings.set("vtta-tokenizer", "paste-target", "token");
          break;
        }
        // no default
      }
    });

    super.activateListeners(html);
  }

  async _initToken(src) {
    let imgSrc = src ?? CONST.DEFAULT_TOKEN;
    try {
      const img = await Utils.download(imgSrc);
      this.Token.addImageLayer(img);
      if (game.settings.get("vtta-tokenizer", "add-frame-default")) {
        await this._setTokenFrame();
      } 
    } catch (error) {
      if (!src || src === CONST.DEFAULT_TOKEN) {
        logger.error(`Failed to load fallback token: "${imgSrc}"`);
      } else {
        ui.notifications.error(`Failed to load token: "${imgSrc}", falling back to "${CONST.DEFAULT_TOKEN}"`);
        logger.error(error);
        await this._initToken();
      }
    }
  }

  async _setTokenFrame(fileName) {
    // load the default frame, if there is one set
    const type = this.tokenOptions.type === "pc" ? "pc" : "npc";
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

  pasteImage(event) {
    const pasteTarget = game.settings.get("vtta-tokenizer", "paste-target");
    const view = pasteTarget === "token" ? this.Token : this.Avatar;
    Utils.extractImage(event, view);
  }

  loadImages(html) {
    let tokenView = document.querySelector(".token > .view");
    const nameSuffix = this.tokenOptions.nameSuffix ? this.tokenOptions.nameSuffix : "";

    // get the target filename for the avatar
    this._getFilename("Avatar", nameSuffix).then((targetFilename) => {
      $('input[name="targetAvatarFilename"]').val(targetFilename);
    });
    // get the target filename for the token
    this._getFilename("Token", nameSuffix).then((targetFilename) => {
      $('span[name="targetFilename"]').text(targetFilename);
      $('input[name="targetTokenFilename"]').val(targetFilename);
    });

    if (this.tokenOptions.isWildCard) {
      $("#vtta-tokenizer div.token > h1").text("Token (Wildcard)");
      this.Token = new View(game.settings.get("vtta-tokenizer", "token-size"), tokenView);
      // load the default frame, if there is one set
      this._setTokenFrame();
    } else {
      this.Token = new View(game.settings.get("vtta-tokenizer", "token-size"), tokenView);

      // Add the actor image to the token view
      this._initToken(this.tokenOptions.tokenFilename);
    }

    this._initAvatar(html, this.tokenOptions.avatarFilename);
  }

}

Hooks.on("renderTokenizer", (app) => {
  window.addEventListener("paste", async (e) => {
    // e.preventDefault();
    e.stopPropagation();
    app.pasteImage(e);
  });
  window.addEventListener("drop", async (e) => {
    // e.preventDefault();
    e.stopPropagation();
    app.pasteImage(e);
  });
});

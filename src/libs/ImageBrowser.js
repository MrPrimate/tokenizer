import DirectoryPicker from "./DirectoryPicker.js";
import logger from "../libs/logger.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class ImageBrowser extends HandlebarsApplicationMixin(ApplicationV2) {

  static MAX_ASSETS = 100;

  static async getFileUrl (foundryFilePath, encode = true) {
    let uri;
    try {
      let dir = DirectoryPicker.parse(foundryFilePath);
      if (dir.activeSource == "data" || dir.current.startsWith("https://")) {
        // Local on-server file system
        uri = dir.current;
      } else if (dir.activeSource == "forgevtt") {
        const status = ForgeAPI.lastStatus || await ForgeAPI.status();
        const userId = status.user;
        uri = "https://assets.forge-vtt.com/" + userId + "/" + dir.current;
      } else {
        // S3 Bucket
        uri
          = game.data.files.s3.endpoint.protocol
          + "//"
          + dir.bucket
          + "."
          + game.data.files.s3.endpoint.hostname
          + "/"
          + dir.current;
      }
    } catch (exception) {
      logger.warn(`Unable to determine file URL for '${foundryFilePath}'`);
      throw new Error(`Unable to determine file URL for '${foundryFilePath}'`);
    }
    if (encode) {
      return encodeURI(uri);
    } else {
      return uri;
    }
  }

  constructor(assets, options) {
    super();
    this.assets = assets;
    this.type = options.type || "image";
    this.callback = options.callback;
    this.assetInc = 0;
    this.ignoreScroll = false;
  }

  static PARTS = {
    header: {
      template: "modules/vtta-tokenizer/templates/image-browser/header.hbs",
    },
    form: {
      template: "modules/vtta-tokenizer/templates/image-browser/form.hbs",
    },
  };

  static DEFAULT_OPTIONS = {
    id: "tokenizer-image-browser",
    classes: ["standard-form", "imagebrowser", 'themed', 'theme-light'],
    actions: {
      selectImage: ImageBrowser.selectImage,
      openFilePicker: ImageBrowser.openFilePicker,
    },
    position: {
      width: 902,
      height: "auto",
    },
    tag: "form",
    window: {
      title: "Image Browser",
      resizable: true,
      minimizable: false,
      subtitle: "",
    },
    form: {
      handler: ImageBrowser.formHandler,
      submitOnChange: false,
      closeOnSubmit: false,
    },
  };

  async _prepareContext() {
    let idx = 0;
    const assets = await Promise.all(this.assets.map(async (asset) => {
      const uri = await ImageBrowser.getFileUrl(asset.key, false);
      const result = { uri, label: asset.label, idx };
      idx++;
      return result;
    }));

    const canBrowse = game.user && game.user.can("FILES_BROWSE");

    return {
      canBrowse,
      assets,
    };
  }

  _onRender() {
    this.bringToTop();
    const listEl = this.element.querySelector(".list");
    if (listEl) {
      listEl.addEventListener("scroll", this._onScroll.bind(this));
    }
  }

  static async selectImage(event, target) {
    event.preventDefault();
    const idx = target.dataset.idx;
    this.callback(this.assets[idx].key);
    this.close();
  }

  static async openFilePicker(event) {
    event.preventDefault();
    const directoryPath = game.settings.get("vtta-tokenizer", "frame-directory");
    const usePath = directoryPath === ""
      ? "[data] modules/vtta-tokenizer/img"
      : directoryPath;
    const dir = DirectoryPicker.parse(usePath);
    new foundry.applications.apps.FilePicker.implementation({
      type: 'image',
      displayMode: 'tiles',
      source: dir.activeSource,
      current: dir.current,
      options: { bucket: dir.bucket },
      callback: (imagePath, fPicker) => {
        const formattedPath = fPicker.result.bucket
          ? `[${fPicker.activeSource}:${fPicker.result.bucket}] ${imagePath}`
          : `[${fPicker.activeSource}] ${imagePath}`;
        this.callback(formattedPath);
      },
    }).render();
    this.close();
  }

  async _onScroll(event) {
    if (this.ignoreScroll) return;
    const el = event.currentTarget;
    const bottom = el.scrollHeight - el.scrollTop;
    const height = el.clientHeight;
    if (!this.assets) return;
    if (bottom - 20 < height) {
      this.ignoreScroll = true;
      if (
        this.assetInc * ImageBrowser.MAX_ASSETS
        < this.assets.length
      ) {
        this.assetInc++;
        const listEl = this.element.querySelector(".list");
        const newAssets = this.assets.slice(
          this.assetInc * ImageBrowser.MAX_ASSETS,
          (this.assetInc + 1) * ImageBrowser.MAX_ASSETS,
        );
        const resolvedAssets = await Promise.all(newAssets.map(async (asset) => {
          const uri = await ImageBrowser.getFileUrl(asset.key, false);
          const idx = this.assets.indexOf(asset);
          return { uri, label: asset.label, idx };
        }));
        for (const { uri, label, idx } of resolvedAssets) {
          const div = document.createElement("div");
          div.className = "imageresult draggable";
          div.title = label;
          div.dataset.action = "selectImage";
          div.dataset.idx = idx;
          div.innerHTML = `<img width="100" height="100" src="${uri}"/>`;
          listEl.appendChild(div);
        }
      }
      this.ignoreScroll = false;
    }
  }

}

export default ImageBrowser;

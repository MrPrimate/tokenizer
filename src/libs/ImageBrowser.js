import DirectoryPicker from "./DirectoryPicker.js";
import logger from "../logger.js";

class ImageBrowser extends FormApplication {

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
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "tokenizer-image-browser",
      classes: ["imagebrowser"],
      title: "Image Browser",
      template: "modules/vtta-tokenizer/templates/imagebrowser.hbs",
      width: 880,
      height: "auto",
      resizable: true,
      closeOnSubmit: false,
      submitOnClose: false,
    });
  }

  async getData() {
    // fetch initial asset list
    let idx = 0;
    const assets = await Promise.all(this.assets.map(async (asset) => {
      const uri = await ImageBrowser.getFileUrl(asset.key, false);
      const div = `<div class="imageresult draggable" title="${asset.label}" data-idx="${idx}"><img width="100" height="100" src="${uri}"/></div>`;
      idx++;
      return div;
    }));

    const canBrowse = game.user && game.user.can("FILES_BROWSE");

    const data = {
      canBrowse,
      assets,
    };

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();
    html.find("button").click(this._onClickButton.bind(this));
    html.find(".imageresult").click(this._onClickImage.bind(this));
    html.find(".list").on("scroll", this._onScroll.bind(this));

    this.html = html;
  }

  async _onClickImage(event) {
    event.preventDefault();
    const source = event.currentTarget;
    const idx = source.dataset.idx;
    this.callback(this.assets[idx].key);
    this.close();
  }

  async _onClickButton(event) {
    event.preventDefault();
    const directoryPath = game.settings.get("vtta-tokenizer", "frame-directory");
    const usePath = directoryPath === ""
      ? "[data] modules/vtta-tokenizer/img"
      : directoryPath;
    const dir = DirectoryPicker.parse(usePath);
    new FilePicker({
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
          }
    }).render();
    this.close();
  }

  /**
   * Scroll event
   */
  async _onScroll(event) {
    if (this.ignoreScroll) return;
    const bottom
      = $(event.currentTarget).prop("scrollHeight")
      - $(event.currentTarget).scrollTop();
    const height = $(event.currentTarget).height();
    if (!this.assets) return;
    if (bottom - 20 < height) {
      this.ignoreScroll = true; // avoid multiple events to occur while scrolling
      if (
        this.assetInc * ImageBrowser.MAX_ASSETS
        < this.assets.length
      ) {
        this.assetInc++;
        this.html
          .find(".list")
          .append(
            this.assets.slice(
              this.assetInc * ImageBrowser.MAX_ASSETS,
              (this.assetInc + 1) * ImageBrowser.MAX_ASSETS
            )
          );
        this._reEnableListeners();
      }
      this.ignoreScroll = false;
    }
  }

  // re-enable listeners
  _reEnableListeners() {
    this.html.find("*").off();
    this.activateListeners(this.html);
    this._activateCoreListeners(this.html);
  }

}

export default ImageBrowser;

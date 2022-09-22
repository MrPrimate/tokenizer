import { autoToken } from "../hooks.js";
import logger from "../logger.js";

export default class AutoTokenize extends FormApplication {
  /** @override */
  constructor(object = {}, options = {}) {
    super(object, options);
    this.pack = object;
    this.packName = object.metadata.label;
    this.defaultFrame = game.settings.get("vtta-tokenizer", "default-frame-npc");
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "auto-tokenize",
      classes: ["vtta-tokenizer"],
      title: "Auto Tokenize",
      template: "modules/vtta-tokenizer/templates/auto.hbs",
      width: 350,
    });
  }

  /** @override */
  // eslint-disable-next-line class-methods-use-this
  async getData() {
    const data = {
      packName: this.packName,
      length: this.pack.index.size,
    };
    return {
      data,
      cssClass: "vtta-tokenizer-window"
    };

  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".dialog-button").on("click", this._dialogButton.bind(this));
  }

  static _renderCompleteDialog(title, content) {
    new Dialog(
      {
        title,
        content,
        buttons: { two: { label: "OK" } },
      },
      {
        classes: ["dialog", "auto-complete"],
        template: "modules/vtta-tokenizer/templates/auto-complete.hbs",
      }
    ).render(true);
  }

  async tokenizePack() {
    let currentCount = 1;
    const tokenIndex = this.pack.index.filter((i) => i.name !== "#[CF_tempEntity]");
    const totalCount = tokenIndex.length;
    for (const i of tokenIndex) {
      AutoTokenize._updateProgress(totalCount, currentCount, "token", i.name);
      logger.debug(`Tokenizing ${i.name}`);
      // eslint-disable-next-line no-await-in-loop
      const actor = await this.pack.getDocument(i._id);
      // eslint-disable-next-line no-await-in-loop
      await autoToken(actor, { nameSuffix: `.${this.pack.metadata.name.toLowerCase()}` });
      currentCount++;
    }
  }

  async _dialogButton(event) {
    event.preventDefault();
    event.stopPropagation();

    try {
      $(".import-progress").toggleClass("import-hidden");
      $(".tokenizer-overlay").toggleClass("import-invalid");

      await this.tokenizePack();

      $(".tokenizer-overlay").toggleClass("import-invalid");

      AutoTokenize._renderCompleteDialog(`Successful Token generation for ${this.packName}`, { title: this.packName, description: `Updated ${this.pack.index.size} actor tokens` });

      this.close();
    } catch (err) {
      $(".tokenizer-overlay").toggleClass("import-invalid");
      ui.notifications.error(`There was an error importing ${this.packName}`);
      logger.error(`Error importing file ${this.packName}`, err);
      this.close();
    }

  }

  static _updateProgress(total, count, type, note = "") {
    const localizedType = `vtta-tokenizer.label.${type}`;
    $(".import-progress-bar")
      .width(`${Math.trunc((count / total) * 100)}%`)
      .html(`<span>${game.i18n.localize("vtta-tokenizer.label.Working")} (${game.i18n.localize(localizedType)})... ${note}</span>`);
  }

  static _progressNote(note) {
    $(".import-progress-bar")
      .html(`<span>${game.i18n.localize("vtta-tokenizer.label.Working")} (${note})...</span>`);
  }
}

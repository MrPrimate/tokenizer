import { autoToken } from "../hooks.js";
import logger from "../libs/logger.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class AutoTokenize extends HandlebarsApplicationMixin(ApplicationV2) {

  constructor(pack) {
    super();
    this.pack = pack;
    this.packName = pack.metadata.label;
    this.defaultFrame = game.settings.get("vtta-tokenizer", "default-frame-npc");
  }

  static PARTS = {
    form: {
      template: "modules/vtta-tokenizer/templates/auto.hbs",
    },
  };

  static DEFAULT_OPTIONS = {
    id: "auto-tokenize",
    classes: ["tokenizer"],
    actions: {
      startTokenize: AutoTokenize.startTokenize,
    },
    position: {
      width: 350,
    },
    window: {
      title: "Auto Tokenize",
    },
  };

  // eslint-disable-next-line class-methods-use-this
  async _prepareContext() {
    const data = {
      packName: this.packName,
      length: this.pack.index.size,
    };
    return {
      data,
      cssClass: "tokenizer-window",
    };
  }

  static _renderCompleteDialog(title, content) {
    foundry.applications.api.DialogV2.prompt({
      window: {
        title,
        classes: ["dialog", "auto-complete"],
      },
      content: `<h1>${content.title}</h1><h3>${content.description}</h3>`,
      ok: {
        label: "OK",
      },
    });
  }

  async tokenizePack() {
    let currentCount = 1;
    const tokenIndex = this.pack.index.filter((i) => i.name !== "#[CF_tempEntity]");
    const totalCount = tokenIndex.length;
    for (const i of tokenIndex) {
      this._updateProgress(totalCount, currentCount, "token", i.name);
      logger.debug(`Tokenizing ${i.name}`);
      // eslint-disable-next-line no-await-in-loop
      const actor = await this.pack.getDocument(i._id);
      // eslint-disable-next-line no-await-in-loop
      await autoToken(actor, { nameSuffix: `.${this.pack.metadata.name.toLowerCase()}` });
      currentCount++;
    }
  }

  static async startTokenize() {
    try {
      const progressEl = this.element.querySelector(".import-progress");
      const overlayEl = this.element.querySelector(".tokenizer-overlay");
      progressEl.classList.toggle("import-hidden");
      overlayEl.classList.toggle("import-invalid");

      await this.tokenizePack();

      overlayEl.classList.toggle("import-invalid");

      AutoTokenize._renderCompleteDialog(
        game.i18n.format("vtta-tokenizer.auto.success", { packName: this.packName }),
        {
          title: this.packName,
          description: game.i18n.format("vtta-tokenizer.auto.success-content", { size: this.pack.index.size }),
        },
      );

      this.close();
    } catch (err) {
      const overlayEl = this.element.querySelector(".tokenizer-overlay");
      overlayEl.classList.toggle("import-invalid");
      const errorText = game.i18n.format("vtta-tokenizer.auto.error", { packName: this.packName });
      ui.notifications.error(errorText);
      logger.error(errorText, err);
      this.close();
    }
  }

  _updateProgress(total, count, type, note = "") {
    const localizedType = `vtta-tokenizer.label.${type}`;
    const bar = this.element.querySelector(".import-progress-bar");
    bar.style.width = `${Math.trunc((count / total) * 100)}%`;
    bar.innerHTML = `<span>${game.i18n.localize("vtta-tokenizer.label.Working")} (${game.i18n.localize(localizedType)})... ${note}</span>`;
  }

  _progressNote(note) {
    const bar = this.element.querySelector(".import-progress-bar");
    bar.innerHTML = `<span>${game.i18n.localize("vtta-tokenizer.label.Working")} (${note})...</span>`;
  }
}

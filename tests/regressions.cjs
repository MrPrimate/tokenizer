const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const flatten = (object, prefix = "", result = {}) => {
  for (const [key, value] of Object.entries(object)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object") flatten(value, full, result);
    else result[full] = value;
  }
  return result;
};
const en = flatten(JSON.parse(read("lang/en.json")));
const ru = flatten(JSON.parse(read("lang/ru.json")));
const hooks = new Map();
const notifications = [];
const settings = new Map(Object.entries({
  "log-level": "OFF",
  "title-link": true,
  "default-frame-npc": "[data] frame.png",
  "default-frame-neutral": "[data] frame.png",
  "default-frame-pc": "[data] frame.png",
  "default-frame-tint": "[data] frame.png",
  "default-mask-layer": "[data] mask.png",
  "custom-frames": [],
  "custom-masks": [],
  "image-save-type": "webp",
  "token-only-toggle": true,
  "npc-image-upload-directory": "[data] tokenizer/npc-images"
}));
let latestApp;

class ApplicationV2 {
  constructor() {
    latestApp = this;
  }

  render() {
  }
}

class FilePicker {
  constructor(options) {
    this.options = options;
    FilePicker.last = this;
  }

  static async upload() {
    return { path: "tokenizer/token.webp" };
  }

  static async createDirectory() {
  }

  static async browse() {
    return { files: [] };
  }

  render() {
  }
}

const context = vm.createContext({
  console,
  TextEncoder,
  File: class File {
    constructor(data, name, options) {
      this.data = data;
      this.name = name;
      this.type = options.type;
    }
  },
  Hooks: {
    on: (name, callback) => hooks.set(name, callback),
    once: (name, callback) => hooks.set(name, callback)
  },
  foundry: {
    applications: {
      api: {
        ApplicationV2,
        HandlebarsApplicationMixin: (base) => base
      },
      apps: { FilePicker: { implementation: FilePicker } }
    },
    utils: {
      getProperty: (object, key) => key.split(".").reduce((value, part) => value?.[part], object),
      setProperty: (object, key, value) => {
        const parts = key.split(".");
        const last = parts.pop();
        const parent = parts.reduce((target, part) => target[part] ?? (target[part] = {}), object);
        parent[last] = value;
      }
    }
  },
  game: {
    system: { id: "test" },
    user: { can: () => true },
    canvas: { layers: [] },
    settings: {
      get: (_module, key) => settings.get(key) ?? false,
      settings: { get: () => ({ default: "[data] frame.png" }) }
    },
    i18n: {
      localize: (key) => ru[key] ?? key,
      format: (key, values) => (ru[key] ?? key).replace(/\{([^}]+)\}/g, (_match, name) => values[name])
    }
  },
  ui: { notifications: { error: (message) => notifications.push(message) } },
  canvas: { ready: false }
});
const modules = new Map();

function load(filename) {
  const absolute = path.resolve(root, filename);
  if (!modules.has(absolute)) {
    modules.set(absolute, new vm.SourceTextModule(fs.readFileSync(absolute, "utf8"), {
      context,
      identifier: absolute
    }));
  }
  return modules.get(absolute);
}

let passed = 0;

async function check(name, run) {
  await run();
  passed += 1;
  console.log(`PASS ${name}`);
}

async function main() {
  const entry = load("src/hooks.js");
  await entry.link((specifier, reference) => load(path.resolve(path.dirname(reference.identifier), specifier)));
  await entry.evaluate();
  const DirectoryPicker = load("src/libs/DirectoryPicker.js").namespace.default;
  const Utils = load("src/libs/Utils.js").namespace.default;
  const Tokenizer = load("src/tokenizer/Tokenizer.js").namespace.default;
  const SaveLocations = load("src/libs/TokenizerSaveLocations.js").namespace.TokenizerSaveLocations;
  const CONSTANTS = load("src/constants.js").namespace.default;
  const directory = "tokenizer/npc-images/Таков замысел";
  const encoded = encodeURI(directory);
  const blob = { type: "image/webp" };

  await check("encoded and raw Cyrillic directories resolve to the same local path", () => {
    for (const value of [directory, encoded, `[data] ${encoded}`]) {
      assert.equal(DirectoryPicker.parse(value).current, directory);
    }
    assert.equal(DirectoryPicker.parse(`[public] ${encoded}`).current, directory);
    assert.equal(DirectoryPicker.parse("[data] tokenizer/100%/%D0%A2").current, "tokenizer/100%/Т");
    assert.equal(DirectoryPicker.parse("[data] tokenizer/%E0%A4%A").current, "tokenizer/%E0%A4%A");
    assert.equal(DirectoryPicker.parse("[data] tokenizer/%2520").current, "tokenizer/%20");
  });
  await check("S3, Forge and external URL paths retain their provider spelling", () => {
    assert.equal(DirectoryPicker.parse(`[s3:bucket] ${encoded}`).current, encoded);
    assert.equal(DirectoryPicker.parse(`[s3:bucket] ${encoded}`).bucket, "bucket");
    assert.equal(DirectoryPicker.parse(`[forgevtt] ${encoded}`).current, encoded);
    const url = "https://example.org/Токен%20image?sig=a%2Fb";
    assert.equal(DirectoryPicker.parse(url).current, url);
  });
  await check("upload receives a filesystem path and the Cyrillic filename intact", async () => {
    let received;
    FilePicker.upload = async (...args) => {
      received = args;
      return { path: `${encoded}/Токен.webp` };
    };
    const result = await Utils.uploadToFoundry(blob, `[data] ${encoded}`, "Токен.webp");
    assert.equal(received[0], "data");
    assert.equal(received[1], directory);
    assert.equal(received[2].name, "Токен.webp");
    assert.equal(result, `${encoded}/Токен.webp`);
    await DirectoryPicker.uploadToPath(`[data] ${encoded}`, received[2]);
    assert.equal(received[1], directory);
  });
  await check("missing, empty and error upload responses throw a translated error", async () => {
    for (const response of [undefined, null, {}, { path: "" }, { path: " " }, {
      error: "failed",
      path: "old.webp"
    }]) {
      FilePicker.upload = async () => response;
      await assert.rejects(Utils.uploadToFoundry(blob, `[data] ${encoded}`, "Токен.webp"), /Не удалось сохранить/);
    }
  });
  await check("directory verification creates Cyrillic nested folders without skipping repeated names", async () => {
    const created = [];
    FilePicker.createDirectory = async (_source, target) => {
      created.push(target);
    };
    assert.equal(await DirectoryPicker.verifyPath(DirectoryPicker.parse(`[data] ${encoded}/Таков замысел`)), true);
    assert.deepEqual(created, ["tokenizer", "tokenizer/npc-images", directory, `${directory}/Таков замысел`]);
    created.length = 0;
    await DirectoryPicker.verifyPath(DirectoryPicker.parse("[data] tokenizer/%2520"));
    assert.deepEqual(created, ["tokenizer", "tokenizer/%20"]);
  });
  await check("existing directories are accepted; inaccessible directories fail validation", async () => {
    FilePicker.createDirectory = async () => {
      throw new Error("EEXIST: already exists");
    };
    assert.equal(await DirectoryPicker.verifyPath(DirectoryPicker.parse(`[data] ${encoded}`)), true);
    FilePicker.createDirectory = async () => {
      throw new Error("Папка уже существует");
    };
    FilePicker.browse = async () => ({ files: [] });
    assert.equal(await DirectoryPicker.verifyPath(DirectoryPicker.parse(`[data] ${encoded}`)), true);
    FilePicker.browse = async () => {
      throw new Error("EACCES");
    };
    assert.equal(await DirectoryPicker.verifyPath(DirectoryPicker.parse(`[data] ${encoded}`)), false);
  });
  await check("local image URLs are encoded exactly once", async () => {
    assert.equal(await DirectoryPicker.getFileUrl(`[data] ${encoded}`, "Токен.webp"), encodeURI(`${directory}/Токен.webp`));
  });
  await check("folder picker receives the decoded directory and storage source", async () => {
    const input = {};
    const app = {
      tokenizer: { tokenUploadDirectory: `[data] ${encoded}` },
      element: { querySelector: () => input }
    };
    await SaveLocations.selectDirectory.call(app, {}, { dataset: { target: "tokenUploadDirectory" } });
    assert.equal(FilePicker.last.options.current, directory);
    assert.equal(FilePicker.last.options.activeSource, "data");
    await FilePicker.last.options.callback(encoded, { activeSource: "data" });
    assert.equal(DirectoryPicker.parse(input.value).current, directory);
    app.tokenizer.tokenUploadDirectory = `[s3:bucket] ${encoded}`;
    await SaveLocations.selectDirectory.call(app, {}, { dataset: { target: "tokenUploadDirectory" } });
    assert.equal(FilePicker.last.options.bucket, "bucket");
    assert.equal(FilePicker.last.options.current, encoded);
  });
  await check("wildcard generation browses a decoded Cyrillic path", async () => {
    let target;
    FilePicker.browse = async (_source, value) => {
      target = value;
      return { files: ["one", "two"] };
    };
    const filename = await Tokenizer.prototype._getFilename.call({
      tokenOptions: {
        name: "Таков замысел",
        isWildCard: true,
        tokenFilename: `${encoded}/${encodeURIComponent("Токен")}*.webp`
      },
      wildCardPath: encoded,
      imageFormat: "webp"
    }, "Token");
    assert.equal(target, `${directory}/Токен*.webp`);
    assert.equal(filename, "Токен003.webp");
  });

  const updates = [];
  const actor = {
    name: "Таков замысел",
    type: "npc",
    img: "старый-портрет.webp",
    prototypeToken: {
      randomImg: false,
      texture: { src: "старый-токен.webp" }
    },
    update: async (data) => {
      updates.push(JSON.parse(JSON.stringify(data)));
    }
  };
  const buttons = [];
  hooks.get("getActorSheetHeaderButtons")({ document: actor }, buttons);
  buttons[0].onclick();
  const actorCallback = latestApp.callback;
  await check("actor update accepts a token without an avatar", async () => {
    updates.length = 0;
    await actorCallback({
      actor,
      tokenFilename: `${encoded}/Токен.webp`
    });
    assert.equal(updates.length, 1);
    assert.equal(updates[0].img, undefined);
    assert.ok(updates[0].prototypeToken.texture.src.startsWith(`${encoded}/Токен.webp?`));
  });
  await check("empty filenames never overwrite actor images", async () => {
    updates.length = 0;
    await actorCallback({ actor });
    await actorCallback({
      actor,
      avatarFilename: "",
      tokenFilename: " "
    });
    assert.equal(updates.length, 0);
  });
  await check("avatar-only and wildcard updates preserve token paths", async () => {
    updates.length = 0;
    await actorCallback({
      actor,
      avatarFilename: "Портрет.webp?old",
      isWildCard: true,
      tokenFilename: "Токен*.webp"
    });
    assert.ok(updates[0].img.startsWith("Портрет.webp?"));
    assert.equal(updates[0].prototypeToken, undefined);
  });
  const form = {
    Avatar: { get: async () => blob },
    Token: { get: async () => blob },
    modifyAvatar: true,
    modifyToken: true,
    avatarUploadDirectory: `[data] ${encoded}`,
    tokenUploadDirectory: `[data] ${encoded}`,
    avatarFileName: "Портрет.webp",
    tokenFileName: "Токен.webp",
    tokenOptions: {
      actor,
      avatarFilename: actor.img,
      tokenFilename: actor.prototypeToken.texture.src
    },
    updateAvatar: Tokenizer.prototype.updateAvatar,
    updateToken: Tokenizer.prototype.updateToken,
    callback: actorCallback
  };
  await check("failed token upload stops form submission before actor update", async () => {
    updates.length = 0;
    FilePicker.upload = async (_source, _directory, file) => file.name === "Портрет.webp" ? { path: "Портрет.webp" } : {};
    await assert.rejects(Tokenizer.formHandler.call(form), /Не удалось сохранить/);
    assert.equal(updates.length, 0);
  });
  await check("successful submission awaits actor update", async () => {
    FilePicker.upload = async (_source, _directory, file) => ({ path: `${encoded}/${file.name}` });
    let finished = false;
    form.callback = async (response) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      await actorCallback(response);
      finished = true;
    };
    await Tokenizer.formHandler.call(form);
    assert.equal(finished, true);
    assert.ok(updates[0].img.startsWith(`${encoded}/Портрет.webp?`));
    assert.ok(updates[0].prototypeToken.texture.src.startsWith(`${encoded}/Токен.webp?`));
  });
  await check("callback errors propagate to form submission", async () => {
    form.callback = async () => {
      throw new Error("Actor update failed");
    };
    await assert.rejects(Tokenizer.formHandler.call(form), /Actor update failed/);
  });
  await check("Russian translations cover English keys and preserve interpolation", () => {
    assert.deepEqual(Object.keys(ru).sort(), Object.keys(en).sort());
    for (const [key, value] of Object.entries(en)) {
      assert.ok(ru[key].trim(), key);
      const placeholders = (text) => (text.match(/\{[^}]+\}/g) ?? []).sort();
      assert.deepEqual(placeholders(ru[key]), placeholders(value), key);
    }
    for (const mode of Object.values(CONSTANTS.BLEND_MODES)) assert.ok(ru[`vtta-tokenizer.blend.${mode}`]);
    for (const file of ["module-template.json", "module-dev.json"]) {
      const manifest = JSON.parse(read(file));
      assert.ok(manifest.languages.some((language) => language.lang === "ru" && language.path === "lang/ru.json"));
      assert.equal(manifest.id, "vtta-tokenizer");
    }
  });
  for (const filename of fs.readdirSync(path.join(root, "lang")).filter((name) => name.endsWith(".json")).sort()) {
    await check(`language ${filename}: translations and English fallback`, () => {
      const translated = flatten(JSON.parse(read(`lang/${filename}`)));
      for (const [key, value] of Object.entries(translated)) {
        assert.equal(typeof value, "string", `${filename}: ${key}`);
        assert.ok(value.trim(), `${filename}: ${key} is empty`);
      }
      let fallbacks = 0;
      for (const [key, english] of Object.entries(en)) {
        const value = translated[key] ?? english;
        if (translated[key] === undefined) fallbacks += 1;
        assert.ok(value.trim(), `${filename}: ${key} has no translation or fallback`);
        const placeholders = (text) => (text.match(/\{[^}]+\}/g) ?? []).sort();
        assert.deepEqual(placeholders(value), placeholders(english), `${filename}: ${key}`);
      }
      console.log(`  ${filename}: ${fallbacks} missing keys use English fallback`);
    });
  }
  await check("UI localization calls resolve to translated keys", () => {
    function inspect(directory) {
      for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) inspect(filename);
        else if (/\.(js|hbs)$/.test(entry.name)) {
          const source = read(filename).replace(/\$\{CONSTANTS\.MODULE_ID\}/g, "vtta-tokenizer");
          for (const match of source.matchAll(/(?:localize|format)\(?\s*["'`]((?:vtta-tokenizer)\.[A-Za-z0-9.-]+)["'`]/g)) {
            assert.ok(ru[match[1]], `${filename}: ${match[1]}`);
          }
          for (const match of source.matchAll(/title:\s*"(vtta-tokenizer\.[A-Za-z0-9.-]+)"/g)) assert.ok(ru[match[1]], match[1]);
        }
      }
    }

    inspect("src");
    inspect("templates");
  });
  console.log(`${passed} regression checks passed. FilePicker and actor APIs were mocked; no live Foundry test.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import DirectoryPicker from "./DirectoryPicker.js";

/**
 * Game Settings: ImagePicker
 */

const FPClass = foundry.applications.apps.FilePicker.implementation;

class ImagePicker extends FPClass {
  constructor(options = {}) {
    super(options);
  }

  _onSubmit(event) {
    event.preventDefault();
    const path = event.target.file.value;
    const activeSource = this.activeSource;
    const bucket = event.target.bucket ? event.target.bucket.value : null;
    this.field.value = ImagePicker.format({
      activeSource,
      bucket,
      path,
    });
    this.close();
  }

  static async uploadToPath(path, file) {
    const options = DirectoryPicker.parse(path);
    return FPClass.upload(options.activeSource, options.current, file, { bucket: options.bucket });
  }

  // returns the type "Img" for rendering the SettingsConfig
  static Img(val) {
    return val === null ? '' : String(val);
  }

  // formats the data into a string for saving it as a GameSetting
  static format(value) {
    return value.bucket !== null
      ? `[${value.activeSource}:${value.bucket}] ${value.path}`
      : `[${value.activeSource}] ${value.path}`;
  }

  // parses the string back to something the FilePicker can understand as an option
  static parse(inStr) {
    const str = inStr ?? '';
    let matches = str.match(/\[(.+)\]\s*(.+)?/u);
    if (matches) {
      let [, source, current = ''] = matches;
      current = current.trim();
      const [s3, bucket] = source.split(":");
      if (bucket !== undefined) {
        return {
          activeSource: s3,
          bucket: bucket,
          current: current,
        };
      } else {
        return {
          activeSource: s3,
          bucket: null,
          current: current,
        };
      }
    }
    // failsave, try it at least
    return {
      activeSource: "data",
      bucket: null,
      current: str,
    };
  }

  // Adds a FilePicker-Simulator-Button next to the input fields
  static processHtml(html) {
    const root = html instanceof HTMLElement ? html : html[0] ?? html;
    const inputs = root.querySelectorAll(`input[data-dtype="Img"]`);
    inputs.forEach((element) => {
      if (!element.nextElementSibling) {
        let picker = new ImagePicker({
          field: element,
          ...ImagePicker.parse(element.value),
        });
        let pickerButton = document.createElement("button");
        pickerButton.type = "button";
        pickerButton.className = "file-picker";
        pickerButton.title = "Pick image";
        pickerButton.innerHTML = '<i class="fas fa-file-import fa-fw"></i>';
        pickerButton.addEventListener("click", () => {
          picker.render({ force: true });
        });
        element.parentElement.appendChild(pickerButton);
      }
    });
  }


  /** @override */
  _onRender() {
    const footerButton = this.element.querySelector("footer button");
    if (footerButton) {
      footerButton.textContent = "Select Image";
    }
  }
}

Hooks.on("renderSettingsConfig", (app, html) => {
  const root = html instanceof HTMLElement ? html : html[0] ?? html;
  ImagePicker.processHtml(root);
});

export default ImagePicker;

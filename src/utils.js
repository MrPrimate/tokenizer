import DirectoryPicker from "./libs/DirectoryPicker.js";
import logger from "./logger.js";

const SKIPPING_WORDS = [
  "the", "of", "at", "it", "a"
];
export default class Utils {

  static generateUUID() {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) || 0;
    var secondPart = (Math.random() * 46656) || 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  }

  static U2A(str) {
    let reserved = "";
    const code = str.match(/&#(d+);/g);

    if (code === null) {
      return str;
    }

    for (var i = 0; i < code.length; i++) {
      reserved += String.fromCharCode(code[i].replace(/[&#;]/g, ""));
    }

    return reserved;
  }

  static getElementPosition(obj) {
    var curleft = 0,
      curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while ((obj = obj.offsetParent));
      return { x: curleft, y: curtop };
    }
    return undefined;
  }

  static getBaseUploadFolder(type) {
    if (type === "character") {
      return game.settings.get("vtta-tokenizer", "image-upload-directory");
    } else if (type === "npc") {
      return game.settings.get("vtta-tokenizer", "npc-image-upload-directory");
    } else {
      return game.settings.get("vtta-tokenizer", "image-upload-directory");
    }
  }

  static upload() {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();

    return new Promise((resolve, reject) => {
      fileInput.addEventListener("change", (event) => {
        // setup the FileReader
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          let img = document.createElement("img");
          img.addEventListener("load", () => {
            resolve(img);
          });
          img.src = reader.result;
        });
        if (file) {
          reader.readAsDataURL(file);
        } else {
          reject("No input file given");
        }
      });
    });
  }

  /**
   * Should the image use the proxy?
   * @param {*} url
   */
  static useProxy(url) {
    if (
      url.toLowerCase().startsWith("https://www.dndbeyond.com/") ||
      url.toLowerCase().startsWith("https://dndbeyond.com/") ||
      url.toLowerCase().startsWith("https://media-waterdeep.cursecdn.com/")
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Downloads an image from a given URL
   * @param {String} url URL of the image that we try to download
   */
  static async download(url) {
    if (!url) url = "icons/mystery-man.png";
    const proxy = await game.settings.get("vtta-tokenizer", "proxy");
    const useProxy = Utils.useProxy(url);
    // const forgeImage = url.startsWith("https://assets.forge-vtt.com/");
    const s3 = url.includes("s3") && url.includes("amazonaws.com");
    return new Promise((resolve, reject) => {
      let img = new Image();
      if (!s3) img.crossOrigin = "Anonymous";
      img.addEventListener("load", () => {
        resolve(img);
      });
      img.addEventListener("error", (event) => {
        reject(event);
      });
      let imgSrc = useProxy ? proxy + url : url;
      img.src = imgSrc;
    });
  }

  static async uploadToFoundry(data, filename, type, overRideFolder) {
    // create new file from the response
    let file = new File([data], filename, { type: data.type });

    const options = overRideFolder
      ? DirectoryPicker.parse(overRideFolder)
      : DirectoryPicker.parse(Utils.getBaseUploadFolder(type));
    
    const result = await FilePicker.upload(
      options.activeSource,
      options.current,
      file,
      { bucket: options.bucket }
    );
    return result.path;
  }

  static rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw new Error('Invalid color component');
    // eslint-disable-next-line no-bitwise
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  static getHash(str, algo = "SHA-256") {
    let strBuf = new TextEncoder("utf-8").encode(str);

    if (window.isSecureContext) {
      return crypto.subtle.digest(algo, strBuf).then((hash) => {
        // window.hash = hash;
        // here hash is an arrayBuffer,
        // so we'll convert it to its hex version
        let result = "";
        const view = new DataView(hash);
        for (let i = 0; i < hash.byteLength; i += 4) {
          result += ("00000000" + view.getUint32(i).toString(16)).slice(-8);
        }
        return result;
      });
    } else {
      return new Promise((resolve) => {
        resolve(
          str.split("").reduce((a, b) => {
            // eslint-disable-next-line no-bitwise
            a = (a << 5) - a + b.charCodeAt(0);
            // eslint-disable-next-line no-bitwise
            return a & a;
          }, 0)
        );
      });
    }
  }

  static async makeSlug(name) {
    const toReplace =
      "а,б,в,г,д,е,ё,ж,з,и,й,к,л,м,н,о,п,р,с,т,у,ф,х,ц,ч,ш,щ,ъ,ы,ь,э,ю,я".split(
        ","
      );
    const replacers =
      "a,b,v,g,d,e,yo,zh,z,i,y,k,l,m,n,o,p,r,s,t,u,f,kh,c,ch,sh,sch,_,y,_,e,yu,ya".split(
        ","
      );
    const replaceDict = Object.fromEntries(
      toReplace.map((_, i) => [toReplace[i], replacers[i]])
    );
    const unicodeString = name
      .toLowerCase()
      .split("")
      .map((x) => (Object.prototype.hasOwnProperty.call(replaceDict, x) ? replaceDict[x] : x))
      .join("")
      .replace(/[^\w.]/gi, "_")
      .replace(/__+/g, "_");
    let asciiString = Utils.U2A(unicodeString);
    return new Promise((resolve) => {
      if (asciiString.length < 2) {
        Utils.getHash(name).then((hash) => {
          logger.debug("Tokenizer is having to use a hashed file name.");
          resolve(hash);
        });
      } else {
        resolve(asciiString);
      }
    });
  }

  static titleString (text) {
    const words = text.trim().split(" ");

    for (let i = 0; i < words.length; i++) {
      if (words[i][0] && (i == 0 || !SKIPPING_WORDS.includes(words[i]))) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
    }

    return words.join(" ");
  }
}

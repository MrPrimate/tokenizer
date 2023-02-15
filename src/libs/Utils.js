import DirectoryPicker from "./DirectoryPicker.js";
import logger from "./logger.js";

const SKIPPING_WORDS = [
  "the", "of", "at", "it", "a"
];

export default class Utils {

  static htmlToDoc (text) {
    const parser = new DOMParser();
    return parser.parseFromString(text, "text/html");
  }

  static endsWithAny(suffixes, string) {
    return suffixes.some((suffix) => {
        return string.endsWith(suffix);
    });
  }

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
    let curleft = 0,
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
  static async useProxy(url) {
    if (
      url.toLowerCase().startsWith("https://www.dndbeyond.com/")
      || url.toLowerCase().startsWith("https://dndbeyond.com/")
      || url.toLowerCase().startsWith("https://media-waterdeep.cursecdn.com/")
      || url.toLowerCase().startsWith("https://images.dndbeyond.com")
    ) {
      return true;
    } else if (
      await game.settings.get("vtta-tokenizer", "force-proxy")
      && url.toLowerCase().match("^https?://")
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Converts url to proxied url
   * @param {*} url
   * @param {*} proxy
   */
  static proxiedUrl(url, proxy) {
    if (proxy.match("%URL%")) {
      return proxy.replace("%URL%", encodeURIComponent(url));
    } else {
      return proxy + url;
    }
  }

  /**
   * Downloads an image from a given URL
   * @param {String} url URL of the image that we try to download
   */
  static async download(url) {
    if (!url) url = "icons/mystery-man.png";
    const proxy = await game.settings.get("vtta-tokenizer", "proxy");
    const useProxy = await Utils.useProxy(url);
    const dateTag = `${+new Date()}`;
    const forge = (typeof ForgeVTT !== "undefined" && ForgeVTT?.usingTheForge);
    return new Promise((resolve, reject) => {
      const proxyImg = useProxy ? Utils.proxiedUrl(url, proxy) : url;
      // we remove existing data tag and add a new one
      // this forces chrome to reload the image rather than using the cached value
      // this can cause problems dues to https://stackoverflow.com/questions/12648809/cors-policy-on-cached-image
      // an exception for using moulinette on the forge because of _reasons_
      const imgSrc = forge && proxyImg.startsWith("moulinette")
        ? proxyImg
        : `${proxyImg.split("?")[0]}?${dateTag}`;
      let img = new Image();
      // cross origin needed for images from other domains
      // an empty value here defaults to anonymous
      img.crossOrigin = "";
      img.onerror = function(event) {
        logger.error("Download listener error", event);
        reject(event);
      };
      img.onload = function() {
        logger.debug("Loading image:", img);
        resolve(img);
      };
      // img.addEventListener("load", () => {
      //   logger.debug("Loading image:", img);
      //   resolve(img);
      // });
      // img.addEventListener("error", (event) => {
      //   logger.error("Download listener error", event);
      //   reject(event);
      // });
      // add image source after adding handlers
      img.src = imgSrc;
    });
  }

  static async uploadToFoundry(data, directoryPath, fileName) {
    // create new file from the response
    let file = new File([data], fileName, { type: data.type });

    const options = DirectoryPicker.parse(directoryPath);

    logger.debug(`Uploading ${fileName}`, { directoryPath, fileName, options });

    const result = (game.version)
      ? await FilePicker.upload(options.activeSource, options.current, file, { bucket: options.bucket }, { notify: false })
      : await FilePicker.upload(options.activeSource, options.current, file, { bucket: options.bucket });

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
    const toReplace
      = "а,б,в,г,д,е,ё,ж,з,и,й,к,л,м,н,о,п,р,с,т,у,ф,х,ц,ч,ш,щ,ъ,ы,ь,э,ю,я".split(
        ","
      );
    const replacers
      = "a,b,v,g,d,e,yo,zh,z,i,y,k,l,m,n,o,p,r,s,t,u,f,kh,c,ch,sh,sch,_,y,_,e,yu,ya".split(
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

  static extractImage(event, view) {
    const evData = event?.clipboardData || event?.dataTransfer;

    if (!evData.items) return;

    for (const item of evData.items) {
      if (item.type.startsWith('image')) {
        const blob = item.getAsFile();
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.addEventListener("load", () => {
          view.addImageLayer(img);
        });
        const reader = new FileReader();
        reader.onload = function(ev) {
          img.src = ev.target.result;
        }; 
        reader.readAsDataURL(blob);
      }
    }
  }

  static cloneCanvas(sourceCanvas) {
    const cloneCanvas = document.createElement("canvas");
    cloneCanvas.width = sourceCanvas.width;
    cloneCanvas.height = sourceCanvas.height;
    cloneCanvas.getContext("2d").drawImage(sourceCanvas, 0, 0);
    return cloneCanvas;
  }

  static versionCompare (v1, v2, options) {
    const lexicographical = options && options.lexicographical;
    const zeroExtend = options && options.zeroExtend;
    let v1parts = v1.split(".");
    let v2parts = v2.split(".");

    function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }

    if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push("0");
      while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
        return 1;
      }

      if (v1parts[i] > v2parts[i]) {
        return 1;
      }
      if (v1parts[i] < v2parts[i]) {
        return -1;
      }
    }

    if (v1parts.length != v2parts.length) {
      return -1;
    }

    return 0;
  }

}



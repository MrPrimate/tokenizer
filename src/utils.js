import DirectoryPicker from "./libs/DirectoryPicker.js";

export default class Utils {
  static generateUUID() {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
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

  static upload() {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.click();

    return new Promise((resolve, reject) => {
      fileInput.addEventListener("change", event => {
        // setup the FileReader
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          let img = document.createElement("img");
          img.addEventListener("load", result => {
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
    console.log(`Proxy for ${img}: ${useProxy}`);
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.addEventListener("load", event => {
        resolve(img);
      });
      img.addEventListener("error", event => {
        reject(event);
      });
      let imgSrc = useProxy ? proxy + url : url;
      img.src = imgSrc;
    });
  }

  static async uploadToFoundry(data, filename) {
    return new Promise((resolve, reject) => {
      data.then(blob => {
        // replacing special characters in the desired filename with underscores
        filename = filename.replace(/[^\w.]/gi, "_").replace(/__+/g, "");

        let formData = new FormData();
        formData.append("target", game.settings.get("vtta-tokenizer", "image-upload-directory"));

        let target = game.data.version === "0.4.0" ? "user" : game.data.version === "0.4.1" ? "user" : "data";
        formData.append("source", target);

        formData.append("upload", blob, filename);

        let req = new XMLHttpRequest();
        req.open("POST", "/upload", true);
        req.onreadystatechange = () => {
          if (req.readyState !== 4) return;
          if (req.status === 200) {
            resolve(`${game.settings.get("vtta-tokenizer", "image-upload-directory")}/${filename}`);
          } else {
            reject(req.responseText);
          }
        };
        req.send(formData);
      });
    });
  }

  static async uploadToFoundryV2(data, path, filename) {
    return new Promise(async (resolve, reject) => {
      // create new file from the response
      let file = new File([data], filename, { type: data.type });

      /**
       * Extract the datasource from the path
       * "[s3:bucketname] path"
       * "[data] path"
       * "[core] path"
       * @param {string} val A reference to the target path coming from settingsextender (patched)
       */

      const getDataSource = val => {
        let source = "data";
        let path = val;

        // check if we are using the patched settings extender
        let matches = val.trim().match(/\[(.+)\]\s*(.+)/);
        if (matches) {
          // we do
          source = matches[1];
          // get bucket information, if S3 is used
          const [s3Source, bucket] = source.split(":");
          if (bucket !== undefined) {
            return {
              source: s3Source,
              bucket: bucket,
              path: matches[2],
            };
          } else {
            return {
              source: source,
              bucket: null,
              path: matches[2],
            };
          }
        } else {
          return {
            source: source,
            path: path,
          };
        }
      };

      const target = getDataSource(path);
      let result = await FilePicker.upload(
        target.source,
        target.path,
        file,
        target.bucket ? { bucket: target.bucket } : {}
      );
      resolve(result.path);
    });
  }

  static async uploadToFoundryV3(data, filename) {
    // create new file from the response
    let file = new File([data], filename, { type: data.type });

    const options = DirectoryPicker.parse(game.settings.get("vtta-tokenizer", "image-upload-directory"));
    const result = await FilePicker.upload(options.activeSource, options.current, file, { bucket: options.bucket });
    return result.path;
  }

  static makeSlug(s) {
    const toReplace = "а,б,в,г,д,е,ё,ж,з,и,й,к,л,м,н,о,п,р,с,т,у,ф,х,ц,ч,ш,щ,ъ,ы,ь,э,ю,я".split(",");
    const replacers = "a,b,v,g,d,e,yo,zh,z,i,y,k,l,m,n,o,p,r,s,t,u,f,kh,c,ch,sh,sch,_,y,_,e,yu,ya".split(",");
    const replaceDict = Object.fromEntries(toReplace.map((_, i) => [toReplace[i], replacers[i]]));
    return s.toLowerCase()
      .split("")
      .map(x => replaceDict.hasOwnProperty(x) ? replaceDict[x] : x)
      .join("")
      .replace(/[^\w.]/gi, "_")
      .replace(/__+/g, "_")
  }
}

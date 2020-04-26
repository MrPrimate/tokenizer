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
      fileInput.addEventListener("change", (event) => {
        // setup the FileReader
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          let img = document.createElement("img");
          img.addEventListener("load", (result) => {
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
   * Downloads an image from a given URL
   * @param {String} url URL of the image that we try to download
   */
  static download(url) {
    if (!url) url = "icons/mystery-man.png";
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.addEventListener("load", (event) => {
        resolve(img);
      });
      img.addEventListener("error", (event) => {
        reject(event);
      });
      let imgSrc =
        url.toLowerCase().indexOf("http") === 0
          ? "https://proxy.iungimus.de/get/" + url
          : url;
      img.src = imgSrc;
    });
  }

  static async uploadToFoundry(data, filename) {
    return new Promise((resolve, reject) => {
      data.then((blob) => {
        // replacing special characters in the desired filename with underscores
        filename = filename.replace(/[^\w.]/gi, "_").replace(/__+/g, "");

        let formData = new FormData();
        formData.append(
          "target",
          game.settings.get("vtta-tokenizer", "image-upload-directory")
        );

        let target =
          game.data.version === "0.4.0"
            ? "user"
            : game.data.version === "0.4.1"
            ? "user"
            : "data";
        formData.append("source", target);

        formData.append("upload", blob, filename);

        let req = new XMLHttpRequest();
        req.open("POST", "/upload", true);
        req.onreadystatechange = () => {
          if (req.readyState !== 4) return;
          if (req.status === 200) {
            resolve(
              `${game.settings.get(
                "vtta-tokenizer",
                "image-upload-directory"
              )}/${filename}`
            );
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
      const getDataSource = (val) => {
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

  //   static async uploadImage(url, targetDirectory, baseFilename) {
  //     async function download(url) {
  //       return new Promise((resolve, reject) => {
  //         try {
  //           let req = new XMLHttpRequest();
  //           req.open("GET", url);
  //           req.responseType = "blob";
  //           req.onerror = () => reject("Network error");
  //           req.onload = () => {
  //             if (req.status === 200) resolve(req.response);
  //             else reject("Loading error: " + req.statusText);
  //           };
  //           req.send();
  //         } catch (error) {
  //           reject(error.message);
  //         }
  //       });
  //     }

  //     async function upload(data, path, filename) {
  //       return new Promise(async (resolve, reject) => {
  //         // create new file from the response
  //         let file = new File([data], filename, { type: data.type });

  //         /**
  //          * Extract the datasource from the path
  //          * "[s3:bucketname] path"
  //          * "[data] path"
  //          * "[core] path"
  //          * @param {string} val A reference to the target path coming from settingsextender (patched)
  //          */
  //         const getDataSource = (val) => {
  //           let source = "data";
  //           let path = val;

  //           // check if we are using the patched settings extender
  //           let matches = val.trim().match(/\[(.+)\]\s*(.+)/);
  //           if (matches) {
  //             // we do
  //             source = matches[1];
  //             // get bucket information, if S3 is used
  //             const [s3Source, bucket] = source.split(":");
  //             if (bucket !== undefined) {
  //               return {
  //                 source: s3Source,
  //                 bucket: bucket,
  //                 path: matches[2],
  //               };
  //             } else {
  //               return {
  //                 source: source,
  //                 bucket: null,
  //                 path: matches[2],
  //               };
  //             }
  //           } else {
  //             return {
  //               source: source,
  //               path: path,
  //             };
  //           }
  //         };

  //         const target = getDataSource(path);
  //         let result = await FilePicker.upload(
  //           target.source,
  //           target.path,
  //           file,
  //           target.bucket ? { bucket: target.bucket } : {}
  //         );
  //         resolve(result.path);
  //       });
  //     }

  //     async function process(url, path, filename) {
  //       let data = await download(url);
  //       let result = await upload(data, path, filename);
  //       return result;
  //     }

  //     // prepare filenames
  //     let filename = baseFilename;
  //     let ext = url.split(".").pop().split(/\#|\?/)[0];

  //     // uploading the character avatar and token
  //     try {
  //       let result = await process(
  //         "https://proxy.vttassets.com/?url=" + url,
  //         targetDirectory,
  //         filename + "." + ext
  //       );
  //       return result;
  //     } catch (error) {
  //       console.log(error);
  //       ui.notifications.warn(
  //         "Image upload failed. Please check your vtta-dndbeyond upload folder setting"
  //       );
  //       return null;
  //     }
  //   }
  // }
}

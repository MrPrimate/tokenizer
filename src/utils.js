export default class Utils {
  static generateUUID() {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ('000' + firstPart.toString(36)).slice(-3);
    secondPart = ('000' + secondPart.toString(36)).slice(-3);
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
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.click();

    return new Promise((resolve, reject) => {
      fileInput.addEventListener('change', event => {
        // setup the FileReader
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          let img = document.createElement('img');
          img.addEventListener('load', result => {
            resolve(img);
          });
          img.src = reader.result;
        });
        if (file) {
          reader.readAsDataURL(file);
        } else {
          reject('No input file given');
        }
      });
    });
  }

  /**
   * Downloads an image from a given URL
   * @param {String} url URL of the image that we try to download
   */
  static download(url) {
    if (!url) url = 'icons/mystery-man.png';
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = 'Anonymous';
      img.addEventListener('load', event => {
        resolve(img);
      });
      img.addEventListener('error', event => {
        reject(event);
      });
      let imgSrc = url.toLowerCase().indexOf('http') === 0 ? 'https://proxy.iungimus.de/get/' + url : url;
      img.src = imgSrc;
    });
  }

  static async uploadToFoundry(data, filename) {
    return new Promise((resolve, reject) => {
      data.then(blob => {
        // replacing special characters in the desired filename with underscores
        filename = filename.replace(/[^\w.]/gi, '_').replace(/__+/g, '');

        let formData = new FormData();
        formData.append('target', game.settings.get('vtta-tokenizer', 'image-upload-directory'));

        let target = game.data.version === '0.4.0' ? 'user' : game.data.version === '0.4.1' ? 'user' : 'data';
        formData.append('source', target);

        formData.append('upload', blob, filename);

        let req = new XMLHttpRequest();
        req.open('POST', '/upload', true);
        req.onreadystatechange = () => {
          if (req.readyState !== 4) return;
          if (req.status === 200) {
            resolve(`${game.settings.get('vtta-tokenizer', 'image-upload-directory')}/${filename}`);
          } else {
            reject(req.responseText);
          }
        };
        req.send(formData);
      });
    });
  }
}

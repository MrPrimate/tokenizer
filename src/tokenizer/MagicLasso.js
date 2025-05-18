/* eslint-disable no-continue */
import MagicWand from "../../vendor/MagicWand.js";
import CONSTANTS from "../constants.js";
import Utils from "../libs/Utils.js";

export class MagicLasso {

  #createBaseCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "base-canvas";
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  #drawChequeredBackground(width = 7) {
    this.chequeredSource = document.createElement("canvas");
    this.chequeredSource.id = "chequered-canvas";
    this.chequeredSource.width = this.width;
    this.chequeredSource.height = this.height;
    
    const context = this.chequeredSource.getContext("2d");
    const columns = Math.ceil(this.chequeredSource.width / width);
    const rows = Math.ceil(this.chequeredSource.height / width);

    context.fillStyle = "rgb(212, 163, 19)";
    for (let i = 0; i < rows; ++i) {
      for (let j = 0, col = columns / 2; j < col; ++j) {
        context.rect(
          (2 * j * width) + (i % 2 ? 0 : width),
          i * width,
          width,
          width,
        );
      }
    }
    context.fill();
  }

  #drawLayerCanvas() {
    this.layerCanvas = document.createElement("canvas");
    this.layerCanvas.id = "layer-canvas";
    this.layerCanvas.width = this.width;
    this.layerCanvas.height = this.height;
    this.layerContext = this.layerCanvas.getContext("2d");
    this.layerContext
      .drawImage(
        this.layer.source,
        0,
        0,
        this.layer.source.width,
        this.layer.source.height,
        this.yOffset,
        this.xOffset,
        this.scaledWidth,
        this.scaledHeight,
      );
  }

  #setData() {
    this.data = this.layerContext.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
  }

  #colorPicker() {
    // a nicer looking proxy for the color picker
    this.colorSelector = document.getElementById("magic-lasso-color-selector");
    this.colorSelectorProxy = document.getElementById("magic-lasso-color-selector-proxy");

    this.colorSelectorProxy.addEventListener("click", () => {
      this.colorSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    this.colorSelector.addEventListener('change', (event) => {
      this.colorSelectorProxy.style.backgroundColor = event.target.value;
      this.colorSelectorProxy.classList.remove('transparent');
      const button = document.getElementById("lasso-fill");
      button.disabled = false;
      this.fillColor = event.target.value;
    });
  }

  constructor(layer) {
    this.container = null;
    this.layer = layer;

    this.height = Math.min(1000, layer.source.height, layer.source.width);
    this.width = Math.min(1000, layer.source.height, layer.source.width);

    const crop = game.settings.get(CONSTANTS.MODULE_ID, "default-crop-image");
    // if we crop the image we scale to the smallest dimension of the image
    // otherwise we scale to the largest dimension of the image
    const direction = crop ? layer.source.height > layer.source.width : layer.source.height < layer.source.width;

    this.scaledWidth = !direction
      ? this.height * (layer.source.height / layer.source.width)
      : this.width;
    this.scaledHeight = direction
      ? this.width * (layer.source.height / layer.source.width)
      : this.height;

    // offset the canvas for the scaled image
    this.yOffset = (this.width - this.scaledWidth) / 2;
    this.xOffset = (this.height - this.scaledHeight) / 2;

    this.data = null;
    this.mask = null;
    this.oldMask = null;
    this.context = null;

    // create base canvases
    this.#drawChequeredBackground();
    this.#drawLayerCanvas();
    this.#createBaseCanvas();
    this.#setData();

    // magic laso vars
    this.colorThreshold = 15;
    this.blurRadius = 5;
    this.simplifyCount = 30;
    this.hatchLength = 4;
    this.hatchOffset = 0;
    this.fillColor = "f59042";

    this.cacheInd = null;
    this.downPoint = null;
    this.allowDraw = false;
    this.addMode = false;
    this.currentThreshold = this.colorThreshold;

    this.canvasChanged = false;

  }

  async display(callback, nestedCallback) {
    const html = await renderTemplate("modules/vtta-tokenizer/templates/magic-lasso.hbs");
    this.container = $(html);
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('magic-lasso-wrapper');
    this.wrapper.appendChild(this.chequeredSource);
    this.wrapper.appendChild(this.layerCanvas);
    this.wrapper.appendChild(this.canvas);
    this.container[0].append(this.wrapper);
    $("body").append(this.container);
    this.#activateListeners(callback, nestedCallback);

    this.#colorPicker();
    this.showThreshold();
    this.showBlur();
    this.mask = null;

    this.interval = setInterval(() => {
      this.hatchTick();
    }, 300);
  }

  #activateListeners(callback, nestedCallback) {

    this.callbacks = {
      callback,
      nestedCallback,
    };

    window.addEventListener("keyup", this.onKeyUp.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));

    const wrapper = document.getElementById("magic-lasso-buttons");
    wrapper.addEventListener("click", (event) => {
      if (event.target.nodeName === 'BUTTON') {
        this.clickButton(event);
      }
    });

    const blurRadius = document.getElementById("tokenizer-blur-radius");
    blurRadius.addEventListener("onchange", (event) => {
      this.onRadiusChange(event);
    });

    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));

  }

  // eslint-disable-next-line consistent-return
  #saveAndCleanup(action) {
    clearInterval(this.interval);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
    this.container.remove();

    if (action === "ok" && this.canvasChanged) {
      const source = Utils.cloneCanvas(this.layer.source);
      // rescale the mask back up for the appropriate layer canvas size
      const context = source.getContext("2d");
      context.resetTransform();
      context.clearRect(0, 0, source.width, source.height);
      source.getContext("2d").drawImage(
        this.layerCanvas,
        this.yOffset,
        this.xOffset,
        this.scaledWidth,
        this.scaledHeight,
        0,
        0,
        this.layer.source.width,
        this.layer.source.height,
      );
      return this.callbacks.callback(source, this.callbacks.nestedCallback);
    }
  }

  clickButton(event) {
    event.preventDefault();
    const action = event.data?.action ?? event.target?.dataset?.action;

    if (action === "ok" || action === "cancel") {
      this.#saveAndCleanup(action);
    } else if (action === "fill") {
      this.fill(1);
    } else if (action === "delete") {
      this.fill(0);
    }
  }

  hatchTick() {
    this.hatchOffset = (this.hatchOffset + 1) % (this.hatchLength * 2);
    this.drawBorder(true);
  }

  onRadiusChange(event) {
    this.blurRadius = event.target.value;
    this.showBlur();
  }

  #getMousePointer(event) {
    const realPoint = Utils.getCanvasCords(this.layerCanvas, event);
    return {
      x: Math.floor(realPoint.x),
      y: Math.floor(realPoint.y),
    };
  }

  onMouseDown(event) {
    if (event.button == 0) {
      this.allowDraw = true;
      this.addMode = event.ctrlKey;
      this.downPoint = this.#getMousePointer(event);
      this.drawMask(this.downPoint.x, this.downPoint.y);
    } else {
      this.allowDraw = false;
      this.addMode = false;
      this.oldMask = null;
    }
  }

  onMouseMove(event) {
    if (this.allowDraw) {
      const p = this.#getMousePointer(event);
      if (p.x != this.downPoint.x || p.y != this.downPoint.y) {
        let dx = p.x - this.downPoint.x,
          dy = p.y - this.downPoint.y,
          len = Math.sqrt((dx * dx) + (dy * dy)),
          adx = Math.abs(dx),
          ady = Math.abs(dy),
          sign = adx > ady ? dx / adx : dy / ady;
        sign = sign < 0 ? sign / 5 : sign / 3;
        let threshold = Math.min(
          Math.max(this.colorThreshold + Math.floor(sign * len), 1),
          255,
        );
        if (threshold != this.currentThreshold) {
          this.currentThreshold = threshold;
          this.drawMask(this.downPoint.x, this.downPoint.y);
        }
      }
    }
  }

  onMouseUp() {
    this.allowDraw = false;
    this.addMode = false;
    this.oldMask = null;
    this.currentThreshold = this.colorThreshold;
  }

  onKeyDown(event) {
    if (event.keyCode == 17) this.canvas.classList.add("add-mode");
  }

  // eslint-disable-next-line consistent-return
  onKeyUp(event) {
    switch (event.keyCode) {
      // ctrl
      case 17:
        this.canvas.classList.remove("add-mode");
        break;
      // f
      case 70:
        this.fill(1);
        break;
      // delete
      case 68:
      case 46:
      case 8: 
        this.fill(0);
        break;
      // enter
      case 13:
        this.#saveAndCleanup("ok");
        break;
      // escape
      case 27:
        this.#saveAndCleanup("cancel");
        break;
      // no default
    }
  }

  showThreshold() {
    document.getElementById("tokenizer-threshold").innerHTML = `Threshold: ${this.currentThreshold}`;
  }

  showBlur() {
    document.getElementById("tokenizer-blur-radius").value = this.blurRadius;
  }

  drawMask(x, y) {
    if (!this.data) return;

    this.showThreshold();

    let image = {
      data: this.data.data,
      width: this.canvas.width,
      height: this.canvas.height,
      bytes: 4,
    };

    if (this.addMode && !this.oldMask) {
      this.oldMask = this.mask;
    }

    let old = this.oldMask ? this.oldMask.data : null;
    this.mask = MagicWand.floodFill(image, x, y, this.currentThreshold, old, true);

    if (this.mask) this.mask = MagicWand.gaussBlurOnlyBorder(this.mask, this.blurRadius, old);

    if (this.addMode && this.oldMask) {
      this.mask = this.mask ? MagicLasso.concatMasks(this.mask, this.oldMask) : this.oldMask;
    }

    this.drawBorder();
  }

  drawBorder(noBorder) {
    if (!this.mask) return;

    let x,
      y,
      i,
      j,
      k,
      width = this.canvas.width,
      height = this.canvas.height;

    let imageData = this.layerContext.createImageData(width, height);

    if (!noBorder) this.cacheInd = MagicWand.getBorderIndices(this.mask);

    this.context.clearRect(0, 0, width, height);

    const len = this.cacheInd.length;
    for (j = 0; j < len; j++) {
      i = this.cacheInd[j];
      x = i % width; // calc x by index
      y = (i - x) / width; // calc y by index
      k = ((y * width) + x) * 4;
      if ((x + y + this.hatchOffset) % (this.hatchLength * 2) < this.hatchLength) {
        // detect hatch color
        imageData.data[k + 3] = 255; // black, change only alpha
      } else {
        imageData.data[k] = 255; // white
        imageData.data[k + 1] = 255;
        imageData.data[k + 2] = 255;
        imageData.data[k + 3] = 255;
      }
    }

    this.context.putImageData(imageData, 0, 0);
  }

  trace() {
    let cs = MagicWand.traceContours(this.mask);
    cs = MagicWand.simplifyContours(cs, this.simplifyTolerant, this.simplifyCount);

    this.mask = null;

    // draw contours
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // inner
    this.context.beginPath();
    for (let i = 0; i < cs.length; i++) {
      if (!cs[i].inner) continue;
      let ps = cs[i].points;
      this.context.moveTo(ps[0].x, ps[0].y);
      for (let j = 1; j < ps.length; j++) {
        this.context.lineTo(ps[j].x, ps[j].y);
      }
    }
    this.context.strokeStyle = "red";
    this.context.stroke();
    // outer
    this.context.beginPath();
    for (let i = 0; i < cs.length; i++) {
      if (cs[i].inner) continue;
      let ps = cs[i].points;
      this.context.moveTo(ps[0].x, ps[0].y);
      for (let j = 1; j < ps.length; j++) {
        this.context.lineTo(ps[j].x, ps[j].y);
      }
    }
    this.context.strokeStyle = "blue";
    this.context.stroke();
  }

  static hexToRgb(hex, alpha) {
    const int = parseInt(hex.replace(/^#/, ""), 16);
    // eslint-disable-next-line no-bitwise
    const r = (int >> 16) & 255;
    // eslint-disable-next-line no-bitwise
    const g = (int >> 8) & 255;
    // eslint-disable-next-line no-bitwise
    const b = int & 255;
  
    return [r, g, b, Math.round(alpha * 255)];
  }

  fill(alpha = 0.35) {
    if (!this.mask) return;

    const fullAlpha = (alpha === 0);
    const rgba = MagicLasso.hexToRgb(this.fillColor, alpha);

    let x,
      y,
      data = this.mask.data,
      bounds = this.mask.bounds,
      maskW = this.mask.width,
      width = this.canvas.width,
      height = this.canvas.height,
      imgData = this.layerContext.getImageData(0, 0, width, height);

    for (y = bounds.minY; y <= bounds.maxY; y++) {
      for (x = bounds.minX; x <= bounds.maxX; x++) {
        if (data[(y * maskW) + x] == 0) continue;
        const k = ((y * width) + x) * 4;
        imgData.data[k] = fullAlpha ? 0 : rgba[0];
        imgData.data[k + 1] = fullAlpha ? 0 : rgba[1];
        imgData.data[k + 2] = fullAlpha ? 0 : rgba[2];
        imgData.data[k + 3] = fullAlpha ? 0 : rgba[3];
      }
    }

    this.mask = null;
  
    this.context.clearRect(0, 0, width, height);
    this.layerContext.putImageData(imgData, 0, 0);
    this.canvasChanged = true;
  }

  static concatMasks(mask, old) {
    let data1 = old.data,
      data2 = mask.data,
      w1 = old.width,
      w2 = mask.width,
      b1 = old.bounds,
      b2 = mask.bounds,
      b = {
        // bounds for new mask
        minX: Math.min(b1.minX, b2.minX),
        minY: Math.min(b1.minY, b2.minY),
        maxX: Math.max(b1.maxX, b2.maxX),
        maxY: Math.max(b1.maxY, b2.maxY),
      },
      w = old.width, // size for new mask
      h = old.height,
      i,
      j,
      k,
      k1,
      k2,
      len;
  
    let result = new Uint8Array(w * h);
  
    // copy all old mask
    len = b1.maxX - b1.minX + 1;
    i = (b1.minY * w) + b1.minX;
    k1 = (b1.minY * w1) + b1.minX;
    k2 = (b1.maxY * w1) + b1.minX + 1;
    // walk through rows (Y)
    for (k = k1; k < k2; k += w1) {
      result.set(data1.subarray(k, k + len), i); // copy row
      i += w;
    }
  
    // copy new mask (only "black" pixels)
    len = b2.maxX - b2.minX + 1;
    i = (b2.minY * w) + b2.minX;
    k1 = (b2.minY * w2) + b2.minX;
    k2 = (b2.maxY * w2) + b2.minX + 1;
    // walk through rows (Y)
    for (k = k1; k < k2; k += w2) {
      // walk through cols (X)
      for (j = 0; j < len; j++) {
        if (data2[k + j] === 1) result[i + j] = 1;
      }
      i += w;
    }
  
    return {
      data: result,
      width: w,
      height: h,
      bounds: b,
    };
  }

}

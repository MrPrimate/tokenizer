import CONSTANTS from "../constants.js";
import Utils from "../libs/Utils.js";

export class Masker {

  #drawChequeredBackground(width = 7) {
    this.chequeredSource = document.createElement("canvas");
    this.chequeredSource.width = this.width;
    this.chequeredSource.height = this.height;
    
    const context = this.chequeredSource.getContext("2d");
    const fillStyle = context.fillStyle;
    const alpha = context.globalAlpha;
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

    context.fillStyle = fillStyle;
    context.globalAlpha = alpha;

    this.chequeredSource.getContext("2d")
      .drawImage(
        this.layer.preview,
        0,
        0,
        this.layer.preview.width,
        this.layer.preview.height,
        this.yOffset,
        this.xOffset,
        this.scaledWidth,
        this.scaledHeight,
      );
  }

  #drawGreyScaleBackground() {
    this.greyscale = document.createElement("canvas");
    this.greyscale.width = this.width;
    this.greyscale.height = this.height;
    this.greyscale.filter = "grayscale()";
    this.greyscale.getContext("2d")
      .drawImage(
        this.layer.preview,
        0,
        0,
        this.layer.preview.width,
        this.layer.preview.height,
        this.yOffset,
        this.xOffset,
        this.scaledWidth,
        this.scaledHeight,
      );
  }

  #createBaseCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  #createMaskCanvas() {
    this.mask = Utils.cloneCanvas(this.canvas);
    this.mask.width = this.width;
    this.mask.height = this.height;

    this.maskContext = this.mask.getContext("2d");
    this.maskContext.resetTransform();
    this.maskContext.clearRect(0, 0, this.width, this.height);
    this.maskContext.drawImage(
      this.layer.renderedMask,
      0,
      0,
      this.layer.renderedMask.width,
      this.layer.renderedMask.height,
      this.yOffset,
      this.xOffset,
      this.scaledWidth,
      this.scaledHeight,
    );

    this.maskContext.lineJoin = "round";
    this.maskContext.lineCap = "round";
  }

  #createMaskedSourceCanvas() {
    this.maskedSource = document.createElement("canvas");
    this.maskedSource.width = this.width;
    this.maskedSource.height = this.height;
    const maskedContext = this.maskedSource.getContext("2d");
    // add the mask
    maskedContext.drawImage(this.mask, 0, 0);
    maskedContext.globalCompositeOperation = "source-in";
    // now the chequered layer
    maskedContext.drawImage(this.chequeredSource, 0, 0);
  }

  constructor(layer) {
    this.container = null;
    this.layer = layer;

    this.height = Math.min(1000, layer.preview.height, layer.preview.width);
    this.width = Math.min(1000, layer.preview.height, layer.preview.width);

    const crop = game.settings.get(CONSTANTS.MODULE_ID, "default-crop-image");
    // if we crop the image we scale to the smallest dimension of the image
    // otherwise we scale to the largest dimension of the image
    const direction = crop ? layer.preview.height > layer.preview.width : layer.preview.height < layer.preview.width;

    this.scaledWidth = !direction
      ? this.height * (layer.preview.height / layer.preview.width)
      : this.width;
    this.scaledHeight = direction
      ? this.width * (layer.preview.height / layer.preview.width)
      : this.height;

    // offset the canvas for the scaled image
    this.yOffset = (this.width - this.scaledWidth) / 2;
    this.xOffset = (this.height - this.scaledHeight) / 2;

    // create base canvases
    this.#createBaseCanvas();
    this.#createMaskCanvas();

    // create background images
    this.#drawGreyScaleBackground();
    this.#drawChequeredBackground();

    this.brushSize = 20;
    this.maskChanged = false;
    this.currentPoint = { x: 0, y: 0 };
    this.previousPoint = null;
    this.mouseDown = false;
  }

  async display(callback, nestedCallback) {
    const html = await renderTemplate("modules/vtta-tokenizer/templates/mask-editor.hbs");
    this.container = $(html);
    this.container[0].append(this.canvas);
    $("body").append(this.container);
    this.#activateListeners(callback, nestedCallback);
  }

  getMousePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  distanceBetweenLastAndCurrent() {
    return Math.sqrt(((this.currentPoint.x - this.previousPoint.x) ** 2) + ((this.currentPoint.y - this.previousPoint.y) ** 2));
  }

  angleBetweenLastAndCurrent() {
    return Math.atan2(this.currentPoint.x - this.previousPoint.x, this.currentPoint.y - this.previousPoint.y);
  }

  // eslint-disable-next-line consistent-return
  #saveAndCleanup(action, callback, nestedCallback) {
    window.cancelAnimationFrame(this.cancelAnimationFrame);
    window.removeEventListener("keyup", this.onKeyUp);
    this.container.remove();
    delete this.canvas;

    if (action === "ok" && this.maskChanged) {
      const mask = Utils.cloneCanvas(this.layer.renderedMask);
      // rescale the mask back up for the appropriate layer canvas size
      const context = mask.getContext("2d");
      context.resetTransform();
      context.clearRect(0, 0, this.layer.preview.width, this.layer.preview.height);
      mask.getContext("2d").drawImage(
        this.mask,
        this.yOffset,
        this.xOffset,
        this.scaledWidth,
        this.scaledHeight,
        0,
        0,
        this.layer.preview.width,
        this.layer.preview.height,
      );
      return callback(mask, nestedCallback);
    }
  }

  clickButton(event, callback, nestedCallback) {
    event.preventDefault();
    const action = event.data?.action ?? event.target?.dataset?.action;

    if (action) {
      this.#saveAndCleanup(action, callback, nestedCallback);
    }
  }

  drawArc(point, remove) {
    this.maskContext.globalCompositeOperation = remove
      ? "destination-out"
      : "destination-over";

    this.maskContext.fillStyle = "black";
    this.maskContext.beginPath();

    this.maskContext.arc(
      point.x / this.ratio,
      point.y / this.ratio,
      this.brushSize / this.ratio,
      0,
      2 * Math.PI,
    );
    this.maskContext.fill();
    this.maskChanged = true;
  }

  #activateListeners(callback, nestedCallback) {
    let rect = this.canvas.getBoundingClientRect();
    this.ratio = rect.width / this.canvas.width;

    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (event.wheelDelta < 0) {
          if (this.brushSize > 50) this.brushSize -= 7;
          else if (this.brushSize > 25) this.brushSize -= 4;
          else if (this.brushSize > 10) this.brushSize -= 2;
          else this.brushSize--;
          if (this.brushSize <= 1) this.brushSize = 1;
      } else {
          if (this.brushSize > 50) this.brushSize += 7;
          else if (this.brushSize > 25) this.brushSize += 4;
          else if (this.brushSize > 10) this.brushSize += 2;
          else this.brushSize++;
          if (this.brushSize >= 100) this.brushSize = 100;
      }
      }, { passive: false },
    );

    this.canvas.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    this.canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();
      this.mouseDown = [0, 2].includes(event.button);
      if (this.mouseDown) {
        this.previousPoint = this.getMousePointer(event);
        this.drawArc(this.previousPoint, event.shiftKey || event.buttons === 2);
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      this.currentPoint = this.getMousePointer(event);
      if (!this.mouseDown) return;

      const distanceBetween = (point1, point2) => {
        return Math.sqrt(((point2.x - point1.x) ** 2) + ((point2.y - point1.y) ** 2));
      };
      const angleBetween = (point1, point2) => {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
      };

      const distance = distanceBetween(this.previousPoint, this.currentPoint);
      const angle = angleBetween(this.previousPoint, this.currentPoint);

      for (var i = 0; i < distance; i += 1) {
        const x = this.previousPoint.x + (Math.sin(angle) * i);
        const y = this.previousPoint.y + (Math.cos(angle) * i);
        this.drawArc({ x, y }, event.shiftKey || event.buttons === 2);
        this.previousPoint = this.currentPoint;
      }
    });


    // eslint-disable-next-line consistent-return
    this.onKeyUp = (event) => {
      const action = event.keyCode === 13
        ? "ok"
        : event.keyCode === 27
          ? "cancel"
          : null;

      if (action) {
        this.#saveAndCleanup(action, callback, nestedCallback);
      }
    };
    window.addEventListener("keyup", this.onKeyUp);

    const wrapper = document.getElementById("mask-editor-buttons");
    wrapper.addEventListener("click", (event) => {
      if (event.target.nodeName === 'BUTTON') {
        this.clickButton(event, callback, nestedCallback);
      }
    });

  }

  draw() {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // add a grey version to canvas
    context.globalAlpha = 0.25;
    context.drawImage(this.greyscale, 0, 0);
    context.globalAlpha = 1;

    // now the masked version
    this.#createMaskedSourceCanvas();
    context.drawImage(this.maskedSource, 0, 0);

    // add brush
    context.fillStyle = "black";
    context.beginPath();
    context.arc(
      this.currentPoint.x / this.ratio,
      this.currentPoint.y / this.ratio,
      this.brushSize / this.ratio,
      0,
      2 * Math.PI,
    );
    context.fill();

    // begin frame animation for duration of canvas
    this.cancelAnimationFrame = window.requestAnimationFrame(this.draw.bind(this));
  }
}

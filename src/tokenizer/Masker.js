import Utils from "../libs/Utils.js";

export class Masker {

  static html = `
    <div class="masker">
      <div class="tokenizer description">
        <section class="window-content">
          <h1>Custom Mask Editor</h1>
          <p>Add to the mask with the left mouse button, and remove holding shift. </p>
          <p>Remove from the mask, use the right mouse or hold shift with the left mouse button. </p>
          <p>Use the mouse wheel to increase/decrease brush size. </p>
          <div id="mask-editor-buttons" class="buttons"><button data-action="ok" class="tokenizer ui button" title="[Enter] Close and save changes"><i class="fas fa-check"></i> Apply</button><button data-action="cancel" class="tokenizer ui button" title="[ESC] Close and discard changes"><i class="fas fa-times"></i> Cancel</button></div>
        </section>
      </div>
    </div>`;

  constructor(layer) {
    this.container = $(Masker.html);
    this.layer = layer;
    this.canvas = document.createElement("canvas");

    this.canvas.width = layer.canvas.width;
    this.canvas.height = layer.canvas.height;
    this.canvas.getContext("2d").drawImage(layer.canvas, 0, 0);

    this.brushSize = 20;

    this.maskChanged = false;
    this.mask = Utils.cloneCanvas(this.layer.renderedMask);
    this.context = this.mask.getContext("2d");
    this.context.lineJoin = "round";
    this.context.lineCap = "round";

    this.greyscale = document.createElement("canvas");
    this.greyscale.width = layer.canvas.width;
    this.greyscale.height = layer.canvas.height;
    this.greyscale.filter = "grayscale()";
    this.greyscale.getContext("2d").drawImage(layer.canvas, 0, 0);

    this.currentPoint = { x: 0, y: 0 };
    this.previousPoint = null;
    this.container[0].append(this.canvas);
    this.mouseDown = false;

    $("body").append(this.container);
  }

  getMousePointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  distanceBetweenLastAndCurrent() {
    return Math.sqrt(((this.currentPoint.x - this.previousPoint.x) ** 2) + ((this.currentPoint.y - this.previousPoint.y) ** 2));
  }

  angleBetweenLastAndCurrent() {
    return Math.atan2(this.currentPoint.x - this.previousPoint.x, this.currentPoint.y - this.previousPoint.y);
  }

  // eslint-disable-next-line consistent-return
  clickButton(event, callback, nestedCallback) {
    event.preventDefault();
    const action = event.data?.action ?? event.target?.dataset?.action;
    if (action) {
      this.container.remove();
      window.removeEventListener("keyup", this.onKeyUp);

      if (action === "ok" && this.maskChanged) {
        return callback(this.mask, nestedCallback);
      }
    }
  }

  activateListeners(callback, nestedCallback) {
    let rect = this.canvas.getBoundingClientRect();
    this.ratio = rect.width / this.canvas.width;

    this.canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (event.wheelDelta < 0) {
          this.brushSize--;
          if (this.brushSize <= 1) this.brushSize = 1;
      } else {
          this.brushSize++;
          if (this.brushSize >= 100) this.brushSize = 100;
      }
      }, { passive: false }
    );

    this.canvas.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    this.canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();
      this.mouseDown = [0, 2].includes(event.button);
      if (this.mouseDown) {
        this.previousPoint = this.getMousePointer(event);
        this.context.globalCompositeOperation = event.shiftKey
          ? "destination-out"
          : "destination-over";

        this.context.fillStyle = "black";
        this.context.beginPath();

        this.context.arc(
          this.previousPoint.x / this.ratio,
          this.previousPoint.y / this.ratio,
          this.brushSize / this.ratio,
          0,
          2 * Math.PI
        );
        this.context.fill();

        this.maskChanged = true;
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

      for (var i = 0; i < distance; i += 2) {
        const x = this.previousPoint.x + (Math.sin(angle) * i);
        const y = this.previousPoint.y + (Math.cos(angle) * i);

        // create a "delete" operation when holding shift or right click
        // add to the mask
        this.context.globalCompositeOperation = event.shiftKey || event.buttons === 2
          ? "destination-out"
          : "destination-over";

        this.context.fillStyle = "black";
        this.context.beginPath();

        this.context.arc(
          x / this.ratio,
          y / this.ratio,
          this.brushSize / this.ratio,
          0,
          2 * Math.PI
        );
        this.context.fill();

        this.maskChanged = true;
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
        this.container.remove();
        window.removeEventListener("keyup", this.onKeyUp);

        if (action === "ok" && this.maskChanged) {
          return callback(this.mask);
        }
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

  drawChequeredBackground(width = 7) {
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
          width
        );
      }
    }
    context.fill();

    context.fillStyle = fillStyle;
    context.globalAlpha = alpha;
  }

  draw() {
    // add a grey version
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.globalAlpha = 0.25;
    context.drawImage(this.greyscale, 0, 0);

    context.globalAlpha = 1;

    // chequered image
    this.chequeredSource = document.createElement("canvas");
    this.chequeredSource.width = this.layer.canvas.width;
    this.chequeredSource.height = this.layer.canvas.height;
    this.drawChequeredBackground();
    const chequeredSourceContext = this.chequeredSource.getContext("2d");
    chequeredSourceContext.drawImage(this.layer.canvas, 0, 0);

    // now the masked version
    const masked = document.createElement("canvas");
    masked.width = this.layer.canvas.width;
    masked.height = this.layer.canvas.height;
    const maskedContext = masked.getContext("2d");
    maskedContext.drawImage(this.mask, 0, 0);
    maskedContext.globalCompositeOperation = "source-in";
    maskedContext.drawImage(this.chequeredSource, 0, 0);

    context.drawImage(masked, 0, 0);

    context.fillStyle = "black";
    context.beginPath();
    context.arc(
      this.currentPoint.x / this.ratio,
      this.currentPoint.y / this.ratio,
      this.brushSize / this.ratio,
      0,
      2 * Math.PI
    );
    context.fill();

    window.requestAnimationFrame(this.draw.bind(this));
  }
}

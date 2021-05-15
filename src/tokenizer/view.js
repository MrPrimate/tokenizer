import Layer from './layer.js';
import Control from './control.js';
import Utils from '../utils.js';

export default class View {
  constructor(dimension, element) {
    // the canvas where the resulting image is rendered to
    this.canvas = document.createElement('canvas');
    this.canvas.width = dimension;
    this.canvas.height = dimension;
    this.canvas.style.width = dimension;
    this.canvas.style.height = dimension;

    // keep track of all layers
    this.layers = [];

    // keep track of all controls;
    this.controls = [];

    this.menu = null;

    // there is one mask that is active for every layer
    this.mask = null;
    this.maskId = null;

    // the currently selected layer for translation/scaling
    this.activeLayer = null;

    // the user wants to retrieve a color from the view's layers
    this.isColorPicking = false;
    this.colorPickingForLayer = null;

    // The working stage for the View
    this.stage = document.createElement('div');
    this.stage.name = 'view';

    // The controls area for the View
    this.controlsArea = document.createElement('div');
    this.controlsArea.name = 'view-controls';

    // The menu bar for the View
    this.menu = document.createElement('div');
    this.menu.name = 'view-menu';

    // add them both to the designated View element as child nodes
    element.appendChild(this.stage);
    this.stage.appendChild(this.canvas);
    element.appendChild(this.controlsArea);
    element.appendChild(this.menu);

    // add event listeners for translation/scaling of the active layer
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), {
      passive: false,
    });
  }

  /**
   * Returns the current canvas in one of three types
   * @param {canvas | blob | Image} type Defines the return type: canvas, blob or Image
   */
  get(type = 'canvas') {
    switch (type.toLowerCase()) {
      case 'img':
        return new Promise((resolve, reject) => {
          let img = document.createElement('img');
          img.onload = data => {
            resolve(img);
          };
          img.onerror = error => {
            reject(error);
          };
          img.src = this.canvas.toDataURL();
        });
      case 'blob':
        const imageFormat = game.settings.get("vtta-tokenizer", "image-save-type");
        return new Promise((resolve, reject) => {
          try {
            this.canvas.toBlob(blob => {
                  resolve(blob);
                },
                `image/${imageFormat}`);
          } catch (error) {
            reject(error);
          }
        });
      default:
        return Promise.resolve(this.canvas);
    }
  }

  initializeMenu() {
    let newImageSection = document.createElement('div');
    newImageSection.name = 'color-management';
    newImageSection.classList.add('section');
    var title = document.createElement('span');
    title.innerHTML = 'New Image';
    newImageSection.appendChild(title);

    // Set the mask of this layer
    this.maskControl = document.createElement('button');
    this.maskControl.classList.add('menu-button');
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-globe');
    this.maskControl.appendChild(buttonText);
  }

  /**
   * Enables dragging
   * @param {Event} event
   */
  onMouseDown(event) {
    if (this.isColorPicking) {
      this.endColorPicking(false);
    }

    if (this.activeLayer === null) return;
    this.isDragging = true;
    this.lastPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  /**
   * Disables dragging
   * @param {Event} event
   */
  onMouseUp(event) {
    if (this.activeLayer === null) return;
    this.isDragging = false;
  }

  /**
   * Enables color picking on the current view canvas and (if a drag event is registered) translation
   * of the source image on the view canvas
   * @param {Event} event
   */
  onMouseMove(event) {
    if (this.isColorPicking) {
      var eventLocation = this.getEventLocation(this.canvas, event);
      // Get the data of the pixel according to the location generate by the getEventLocation function
      var pixelData = this.canvas.getContext('2d').getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
      // If transparency on the pixel , array = [0,0,0,0]
      if (pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 0 && pixelData[3] == 0) {
        // Do something if the pixel is transparent
      }
      // Convert it to HEX if you want using the rgbToHex method.
      function rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
        return ((r << 16) | (g << 8) | b).toString(16);
      }
      var hex = '#' + ('000000' + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);

      // update the layer
      let layer = this.layers.find(layer => layer.id === this.colorPickingForLayer);
      // setting the color
      this.colorPickingForLayer.setColor(hex);
      // refreshing the control
      let control = this.controls.find(control => control.layer.id === this.colorPickingForLayer.id);
      control.refresh();
      this.redraw();
    }

    if (this.activeLayer === null) return;
    if (!this.isDragging) return;
    let delta = {
      x: this.lastPosition.x - event.clientX,
      y: this.lastPosition.y - event.clientY,
    };

    if (this.activeLayer.source !== null) {
      this.activeLayer.translate(delta.x, delta.y);
      this.activeLayer.redraw();
      this.redraw();
    }
    this.lastPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  /**
   * Gets the view canvas position on the current page, which is necessary to allow a fluid mousewheel zoom
   * @param {HTMLElement} element
   * @param {Event} event
   */
  getEventLocation(element, event) {
    var pos = Utils.getElementPosition(element);

    return {
      x: event.pageX - pos.x,
      y: event.pageY - pos.y,
    };
  }

  /**
   * Scales the source image on mouse wheel events
   * @param {Event} event
   */
  onWheel(event) {
    if (this.activeLayer === null) return;
    event.preventDefault();

    if (event.shiftKey) {
      let degree = event.deltaY / 100;

      this.activeLayer.rotate(degree);
      this.activeLayer.redraw();
      this.redraw();
    } else {
      var eventLocation = this.getEventLocation(this.canvas, event);
      if (this.activeLayer.source !== null) {
        let scaleDirection = event.deltaY / 100;
        let factor = 1 - scaleDirection * 0.05;

        let dx = (eventLocation.x - this.activeLayer.position.x) * (factor - 1),
          dy = (eventLocation.y - this.activeLayer.position.y) * (factor - 1);

        this.activeLayer.setScale(this.activeLayer.scale * factor);
        this.activeLayer.translate(dx, dy);
        this.activeLayer.redraw();
        this.redraw();
      }
    }
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  removeImageLayer(layerId) {
    let layerArrayId = 0;
    let index = 0;
    for (index = 0; index <= this.layers.length; index++) {
      if (this.layers[index].id === layerId) {
        break;
      }
    }

    // if this layer provided the mask, remove that mask, too
    if (this.layers[index].providesMask) {
      this.maskId = null;
    }

    // delete this from the array
    this.layers.splice(index, 1);

    // now for the controls
    for (index = 0; index <= this.controls.length; index++) {
      if (this.controls[index].layer.id === layerId) {
        break;
      }
    }
    // remove the control first
    let control = this.controls.find(control => control.layer.id === layerId);
    control.view.remove();

    //this.controlsArea.remove(control);

    this.controls.splice(index, 1);
    this.controls.forEach(control => control.refresh());
    this.redraw();
  }

  addImageLayer(img, masked = false) {
    let layer = new Layer(this.width, this.height, null);
    layer.fromImage(img);

    // add the new image on top
    this.layers.unshift(layer);
    this.redraw();

    // add the control at the top of the control array
    let control = new Control(layer, this.layers.length - 1);
    this.controls.unshift(control);

    // add the control at the top of the control area, too
    this.controlsArea.insertBefore(control.view, this.controlsArea.firstChild);
    this.controls.forEach(control => control.refresh());

    // Setup all listeners for this control
    control.view.addEventListener('color', event => {
      this.setColor(event.detail.layerId, event.detail.color);
      this.controls.forEach(control => control.refresh());
    });
    control.view.addEventListener('mask', event => {
      this.activateMask(event.detail.layerId);
      this.controls.forEach(control => control.refresh());
    });
    // if a default mask is applied, trigger the calculation of the mask, too
    if (masked) {
      this.activateMask(layer.id);
      control.refresh();
    }
    control.view.addEventListener('activate', event => {
      this.activateLayer(event.detail.layerId);
      this.controls.forEach(control => control.refresh());
    });
    control.view.addEventListener('deactivate', event => {
      this.deactivateLayers();
      this.controls.forEach(control => control.refresh());
    });
    control.view.addEventListener('center', event => {
      this.centerLayer(event.detail.layerId);
    });
    control.view.addEventListener('move', event => {
      // move the control in sync
      this.moveLayer(event.detail.layerId, event.detail.direction);
      this.controls.forEach(control => control.refresh());
    });
    control.view.addEventListener('pick-color-start', event => {
      this.startColorPicking(event.detail.layerId, event.detail.color);
    });
    control.view.addEventListener('pick-color-end', event => {
      this.endColorPicking(true);
    });
    control.view.addEventListener('delete', event => {
      this.removeImageLayer(event.detail.layerId);
    });
  }

  /**
   * Starts color picking for a given layer
   * @param {String} id The layer that is getting the picked color as a background color
   * @param {*} currentColor The layers current color
   */
  startColorPicking(id) {
    let layer = this.layers.find(layer => layer.id === id);
    layer.saveColor();
    // move the control in sync
    this.isColorPicking = true;
    this.colorPickingForLayer = layer;
    this.canvas.classList.add('isColorPicking');
  }

  /**
   * Ends a color picking state
   * @param {boolean} reset If the user aborted the color picking, we will reset to the original color
   */
  endColorPicking(reset = false) {
    this.canvas.classList.remove('isColorPicking');
    // move the control in sync
    this.isColorPicking = false;

    // update the layer
    if (reset) {
      // setting the color
      this.colorPickingForLayer.restoreColor();
    }

    // refreshing the control
    let control = this.controls.find(control => control.layer.id === this.colorPickingForLayer.id);
    control.endColorPicking();

    this.colorPickingForLayer = null;

    control.refresh();
    this.redraw();
  }

  moveLayer(id, direction) {
    // get the index in the layers-layer for this layer;
    let index = 0;
    for (index = 0; index < this.layers.length; index++) {
      if (this.layers[index].id === id) {
        break;
      }
    }
    // check for validity
    let sourceId = index;
    let targetId = null;
    if (direction === 'up') {
      targetId = sourceId - 1;
    } else {
      targetId = sourceId + 1;
    }
    // check if a valid targetID was derived
    if (this.layers[targetId] !== undefined) {
      // swap the elements
      [this.layers[sourceId], this.layers[targetId]] = [this.layers[targetId], this.layers[sourceId]];
      // swap the corresponding controls, too
      let sourceControl = this.controlsArea.children[sourceId];
      let targetControl = this.controlsArea.children[targetId];

      // swap the elements and enable/disable move controls if they are at the bottom or top
      if (direction === 'up') {
        this.controlsArea.insertBefore(sourceControl, targetControl);
        if (targetId === 0) {
          this.controls[targetId].disableMoveDown();
          this.controls[sourceId].enableMoveDown();
        }
        if (targetId === this.layers.length - 1) {
          this.controls[targetId].disableMoveUp();
          this.controls[sourceId].enableMoveUp();
        }
      } else {
        this.controlsArea.insertBefore(sourceControl, targetControl.nextSibling);
      }
    }
    this.redraw();
  }

  centerLayer(id) {
    let layer = this.layers.find(layer => layer.id === id);
    if (layer !== null) {
      layer.reset();
      this.redraw();
    }
  }
  /**
   * Activates a layer for translation/scaling
   * @param Number | null id of the layer that should activate it's mask, if null: Activate the lowest layer with id = 0
   */
  activateLayer(id = 0) {
    // set all layers to inactive
    this.layers.forEach(layer => (layer.isActive = false));
    this.activeLayer = this.layers.find(layer => layer.id === id);
    // activate the layer with given id
    if (this.activeLayer !== null) {
      this.activeLayer.isActive = true;
    }
    this.redraw();
  }

  /**
   * Deactives all layers (can only be one active at a time...)
   */
  deactivateLayers() {
    this.activeLayer = null;
    this.layers.forEach(layer => (layer.isActive = false));
    /* for (let i = 0; i < this.layers.length; i++) {
          this.layers[i].isActive = false;
      }*/
    this.redraw();
  }

  /**
   * Activates the mask with the given id
   * @param Number | null id of the layer that should activate it's mask, if null: Activate the lowest layer with id = 0
   */
  activateMask(id = 0) {
    let layer = this.layers.find(layer => layer.id === id);

    if (layer !== null) {
      // check if this layer currently provides the mask
      if (layer.providesMask === true) {
        layer.providesMask = false;
        this.maskId = null;
      } else {
        this.maskId = id;
        this.layers.forEach(layer => (layer.providesMask = false));
        layer.providesMask = true;
      }
    }
    this.redraw();
    return true;
  }

  setColor(id = 0, hexColorString) {
    let layer = this.layers.find(layer => layer.id === id);
    if (layer !== null) {
      layer.setColor(hexColorString);
      this.redraw();
    }
  }

  redraw() {
    let maskLayer = undefined
    let ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.maskId !== null) {
      // get the mask layer
      maskLayer = this.layers.find(layer => layer.id === this.maskId);
      // draw the mask at the same position and scale as the source of the layer itself
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(
          maskLayer.sourceMask,
          maskLayer.position.x,
          maskLayer.position.y,
          maskLayer.source.width * maskLayer.scale,
          maskLayer.source.height * maskLayer.scale
      );

      ctx.globalCompositeOperation = 'source-atop';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    // draw all the layers on top of each other
    for (let i = this.layers.length - 1; i >= 0; i--) {
      ctx.drawImage(this.layers[i].view, 0, 0, this.width, this.height);
    }

    // draw the mask again on top as clipping may have happened to semi-transparent pixels
    // but only if defined as the top layer
    if (maskLayer !== undefined) {
      if(this.layers[0].id == maskLayer.id) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(maskLayer.view, 0, 0, this.width, this.height);
      }
    }
  }
}

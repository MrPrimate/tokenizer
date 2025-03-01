import Layer from './Layer.js';
import Control from './Control.js';
import Utils from '../libs/Utils.js';
import CONSTANTS from '../constants.js';
import logger from '../libs/logger.js';
import Color from '../libs/Color.js';

export default class View {
  constructor(tokenizer, dimension, element) {
    this.tokenizer = tokenizer;
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
    this.maskIds = new Set();

    // the currently selected layer for translation/scaling
    this.activeLayer = null;

    // the user wants to retrieve a color from the view's layers
    this.isColorPicking = false;
    this.colorPickingForLayer = null;
    this.colorPickingLayerId = null;

    // alpha picking
    this.isAlphaPicking = false;
    this.alphaPickingForLayer = null;
    this.alphaPickingLayerId = null;
    this.alphaColor = null;
    this.alphaTolerance = 50;

    // The working stage for the View
    this.stage = document.createElement('div');
    this.stage.name = 'view';

    if (element.id === "tokenizer-token") {
      this.stage.setAttribute("id", "token-canvas");
      this.type = "token";
    } else if (element.id === "tokenizer-avatar") {
      this.stage.setAttribute("id", "avatar-canvas");
      this.type = "avatar";
    }

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

    const moveFunction = Utils.throttle(this.onMouseMove.bind(this), 15);
    // add event listeners for translation/scaling of the active layer
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', moveFunction);
    // this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
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
          img.onload = () => {
            resolve(img);
          };
          img.onerror = (error) => {
            reject(error);
          };
          img.src = this.canvas.toDataURL();
        });
      case 'blob': {
        const imageFormat = game.settings.get(CONSTANTS.MODULE_ID, "image-save-type");
        return new Promise((resolve, reject) => {
          try {
            const clone = Utils.cloneCanvas(this.canvas);
            const context = clone.getContext('2d');
            context.clearRect(0, 0, this.width, this.height);

            context.drawImage(
              this.canvas,
              0,
              0,
              this.canvas.width,
              this.canvas.height,
              0,
              0,
              this.width,
              this.height,
            );

            this.canvas.toBlob((blob) => {
              resolve(blob);
            }, `image/${imageFormat}`);
          } catch (error) {
            reject(error);
          }
        });
      }
      default:
        return Promise.resolve(this.canvas);
    }
  }

  /**
   * Get this mask from the layer id or default view
   * @param {id} Number
   */
  getMaskLayer(id) {
    return this.layers.find((layer) => layer.id === id);
  }

    /**
   * Get this mask from the layer id or default view
   * @param {id} Number
   */
  getMaskLayers() {
    return this.layers.find((layer) => this.maskIds.has(layer.id));
  }

  initializeMenu() {
    let newImageSection = document.createElement('div');
    newImageSection.name = 'color-management';
    newImageSection.classList.add('section');
    var title = document.createElement('span');
    title.innerHTML = game.i18n.localize("vtta-tokenizer.label.NewImage");
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
    } else if (this.isAlphaPicking) {
      this.endAlphaPicking(false);
    }

    if (this.activeLayer === null) return;
    this.redraw(true);
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
  // eslint-disable-next-line no-unused-vars
  onMouseUp(event) {
    this.redraw(true);
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
      const eventLocation = Utils.getCanvasCords(this.canvas, event);
      // Get the data of the pixel according to the mouse pointer location
      const pixelData = this.canvas.getContext('2d').getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
      // If transparency on the pixel , array = [0,0,0,0]
      if (pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 0 && pixelData[3] == 0) {
        // Do something if the pixel is transparent
      }
      // Convert it to HEX if you want using the rgbToHex method.
      const hex = '#' + ('000000' + Utils.rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);

      // update the layer
      // setting the color
      this.colorPickingForLayer.setColor(hex);
      // refreshing the control
      let control = this.controls.find((control) => control.layer.id === this.colorPickingForLayer.id);
      control.refresh();
      this.redraw();
    } else if (this.isAlphaPicking) {
      const eventLocation = Utils.getCanvasCords(this.canvas, event);
      const pixelData = this.canvas.getContext('2d').getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
      if (pixelData[0] == 0 && pixelData[1] == 0 && pixelData[2] == 0 && pixelData[3] == 0) {
        // Do nothing if the pixel is transparent
      } else {
        this.alphaColorHex = '#' + ('000000' + Utils.rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
        this.alphaColor = new Color({
          red: pixelData[0],
          green: pixelData[1],
          blue: pixelData[2],
          alpha: pixelData[3],
          tolerance: this.alphaTolerance,
        });
        const control = this.controls.find((control) => control.layer.id === this.alphaPickingForLayer.id);
        control.refresh();
        this.redraw();
      }
    }

    if (this.activeLayer === null) return;
    if (!this.isDragging) return;

    const delta = {
      x: this.lastPosition.x - event.clientX,
      y: this.lastPosition.y - event.clientY,
    };

    if (this.activeLayer.source !== null) {
      this.activeLayer.translate(delta.x, delta.y);
    }
    this.activeLayer.redraw();
    this.redraw(true);
    this.lastPosition = {
      x: event.clientX,
      y: event.clientY,
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
      const degree = event.deltaY / 100;

      this.activeLayer.rotate(degree);
      this.activeLayer.redraw();
      this.redraw();
    } else {
      const eventLocation = Utils.getCanvasCords(this.canvas, event);
      if (this.activeLayer.source !== null) {
        const scaleDirection = event.deltaY / 100;
        const factor = 1 - (scaleDirection * 0.05);
        const dx = (eventLocation.x - this.activeLayer.position.x) * (factor - 1),
          dy = (eventLocation.y - this.activeLayer.position.y) * (factor - 1);

        this.activeLayer.scale *= factor;
        this.activeLayer.translate(dx, dy);
        this.activeLayer.redraw();
        this.redraw(true);
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
    let index = 0;
    for (index = 0; index <= this.layers.length; index++) {
      if (this.layers[index].id === layerId) {
        break;
      }
    }

    // if this layer provided the mask, remove that mask, too
    if (this.layers[index].providesMask) {
      this.maskIds.delete(index);
    }

    // remove any masks applied to other layers
    this.layers.forEach((l) => {
      l.appliedMaskIds.delete(layerId);
    });

    // delete this from the array
    this.layers.splice(index, 1);

    // now for the controls
    for (index = 0; index <= this.controls.length; index++) {
      if (this.controls[index].layer.id === layerId) {
        break;
      }
    }
    // remove the control first
    let control = this.controls.find((control) => control.layer.id === layerId);
    control.view.remove();

    this.controls.splice(index, 1);
    this.controls.forEach((control) => control.refresh());
    this.redraw(true);
  }

  #addLayerControls(layer, { masked, activate } = {}) {
    // add the control at the top of the control array
    const control = new Control(this.tokenizer, layer, this.layers.length - 1);
    this.controls.unshift(control);

    // add the control at the top of the control area, too
    this.controlsArea.insertBefore(control.view, this.controlsArea.firstChild);
    this.controls.forEach((control) => control.refresh());

    // Setup all listeners for this control
    control.view.addEventListener('color', (event) => {
      this.setColor(event.detail.layerId, event.detail.color);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('color-tint', (event) => {
      this.setLayerColorTint(event.detail.layerId, event.detail.color);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('mask', (event) => {
      this.activateMask(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    // if a default mask is applied, trigger the calculation of the mask, too
    if (masked) {
      this.activateMask(layer.id);
      this.controls.forEach((control) => control.refresh());
    }
    control.view.addEventListener('activate', (event) => {
      this.activateLayer(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    if (activate) {
      this.activateLayer(layer.id);
      this.controls.forEach((control) => control.refresh());
    }
    control.view.addEventListener('deactivate', () => {
      this.deactivateLayers();
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('center', (event) => {
      this.centerLayer(event.detail.layerId);
    });
    control.view.addEventListener('reset', (event) => {
      this.resetLayer(event.detail.layerId);
    });
    control.view.addEventListener('flip', (event) => {
      this.mirrorLayer(event.detail.layerId);
    });
    control.view.addEventListener('move', (event) => {
      // move the control in sync
      this.moveLayer(event.detail.layerId, event.detail.direction);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('pick-color-start', (event) => {
      this.startColorPicking(event.detail.layerId);
    });
    control.view.addEventListener('pick-color-end', () => {
      this.endColorPicking(true);
    });
    control.view.addEventListener('pick-alpha-start', (event) => {
      this.startAlphaPicking(event.detail.layerId);
    });
    control.view.addEventListener('pick-alpha-end', () => {
      this.endAlphaPicking(true);
    });
    control.view.addEventListener('delete', (event) => {
      this.removeImageLayer(event.detail.layerId);
    });
    control.view.addEventListener('opacity', (event) => {
      this.setOpacity(event.detail.layerId, event.detail.opacity);
    });
    control.view.addEventListener('visible', (event) => {
      this.setLayerVisibility(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('blend', (event) => {
      this.setBlendMode(event.detail.layerId, event.detail.blendMode, event.detail.mask);
    });
    control.view.addEventListener('edit-mask', async (event) => {
      this.editMask(event.detail.layerId);
    });
    control.view.addEventListener('mask-layer', async (event) => {
      this.customMaskLayerToggle(event.detail.layerId, event.detail.maskLayerId);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('transparency-level', (event) => {
      this.alphaTolerance = event.detail.tolerance;
    });
    control.view.addEventListener('reset-transparency-level', (event) => {
      this.resetTransparencyLevel(event.detail.layerId);
    });
    control.view.addEventListener('reset-mask-layer', (event) => {
      this.resetCustomMaskLayers(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('duplicate', (event) => {
      this.cloneLayer(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('magic-lasso', async (event) => {
      this.magicLasso(event.detail.layerId);
    });
    control.view.addEventListener('centre-layer', (event) => {
      this.centreLayer(event.detail.layerId);
      this.controls.forEach((control) => control.refresh());
    });
    control.view.addEventListener('scale-layer', (event) => {
      this.scaleLayer(event.detail.layerId, event.detail.percent);
      this.controls.forEach((control) => control.refresh());
    });
  }

  addLayer(layer, { masked = false, activate = false }) {
    // add the new layer on top
    this.layers.unshift(layer);
    this.calculateAllDefaultMaskLayers();
    this.redraw(true);

    this.#addLayerControls(layer, { masked, activate });
  }

  addColorLayer({ masked = false, activate = false, color = null } = {},
  ) {
    logger.debug(`adding color layer with options`, {
      imgSrc: `colorLayer: ${color}`,
      masked,
      color,
      activate,
    });

    const imgOptions = {
      view: this,
      color,
      width: this.width,
      height: this.height,
    };

    const layer = Layer.fromColor(imgOptions);
    this.addLayer(layer, { masked, activate });
  }

  addImageLayer(img, { masked = false, activate = false, tintColor = null, tintLayer = false,
    position = { x: null, y: null }, scale = null, maskFromImage = false, visible = true } = {},
  ) {
    const imgSrc = Utils.isString(img.src) && !img.src.startsWith("data:image/png;base64")
      ? img.src
      : "blob-data";

    logger.debug(`adding image layer ${imgSrc}`, {
      imgSrc,
      masked,
      activate,
      tintColor,
      tintLayer,
      position,
      scale,
      maskFromImage,
      visible,
    });

    const imgOptions = {
      view: this,
      img,
      canvasHeight: this.width,
      canvasWidth: this.height,
      tintColor,
      tintLayer,
      maskFromImage,
      visible,
    };

    const layer = Layer.fromImage(imgOptions);

    if (masked) {
      layer.createMask();
      layer.redraw();
    }

    if (scale) layer.scale = scale;
    if (position.x && position.y) {
      const upScaledX = layer.canvas.width * (position.x / this.width);
      const upScaledY = layer.canvas.height * (position.y / this.height);
      layer.translate(upScaledX, upScaledY);
      if (!scale) {
        const newScaleFactor = (layer.canvas.width - (Math.abs(upScaledX) * 2)) / layer.canvas.width;
        layer.scale *= newScaleFactor;
      }
    }

    this.addLayer(layer, { masked, activate });
  }

  setLayerColorTint(id, color) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      if (color) {
        layer.tintColor = color;
        layer.tintLayer = true;
      } else {
        layer.tintColor = null;
        layer.tintLayer = false;
      }
      this.redraw(true);
    }
  }

  /**
   * Starts color picking for a given layer
   * @param {String} id The layer that is getting the picked color as a background color
   */
  startColorPicking(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    layer.saveColor();
    // move the control in sync
    this.isColorPicking = true;
    this.colorPickingForLayer = layer;
    this.canvas.classList.add('isColorPicking');
  }

    /**
   * Starts alpha picking for a given layer
   * @param {String} id The layer that is getting the picked color as a alpha color
   */
  startAlphaPicking(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    layer.saveAlphas();
    // move the control in sync
    this.isAlphaPicking = true;
    this.alphaPickingForLayer = layer;
    this.canvas.classList.add('isColorPicking');
  }

  resetTransparencyLevel(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.alphaPixelColors.clear();
      this.redraw(true);
    }
  }

  resetCustomMaskLayers(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.resetMasks();
      this.redraw(true);
    }
  }

  cloneLayer(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      const newLayer = layer.clone();
      this.addLayer(newLayer, { masked: newLayer.providesMask, activate: false });
      this.redraw(true);
    }
  }

  centreLayer(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.centre();
      this.redraw(true);
    }
  }

  scaleLayer(id, percent) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.scaleByPercent(percent);
      this.redraw(true);
    }
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
      this.redraw(true);
    }

    // refreshing the control
    const control = this.controls.find((control) => control.layer.id === this.colorPickingForLayer.id);
    control.endColorPicking();

    this.colorPickingForLayer = null;

    control.refresh();
    this.redraw(true);
  }

  /**
   * Ends a color picking state
   * @param {boolean} reset If the user aborted the color picking, we will reset to the original color
   */
  endAlphaPicking(reset = false) {
    this.canvas.classList.remove('isColorPicking');
    // move the control in sync
    this.isAlphaPicking = false;

    // update the layer
    if (reset) {
      // setting the color
      this.alphaPickingForLayer.restoreAlphas();
      this.redraw(true);
    } else {
      this.alphaPickingForLayer.addTransparentColour(this.alphaColor);
    }

    // refreshing the control
    const control = this.controls.find((control) => control.layer.id === this.alphaPickingForLayer.id);
    control.endAlphaPicking();

    this.alphaPickingForLayer = null;

    control.refresh();
    this.redraw();
  }

  isOriginLayerHigher(originId, targetId) {
    if (!originId || !targetId) return undefined;
    const originIndex = this.layers.findIndex((layer) => layer.id === originId);
    const targetIndex = this.layers.findIndex((layer) => layer.id === targetId);
    return targetIndex > originIndex;
  }

  moveLayer(id, direction) {
    // get the index in the layers-layer for this layer;
    const sourceId = this.layers.findIndex((layer) => layer.id === id);
    // check for validity
    const targetId = sourceId == -1 
      ? -1
      : (direction === 'up') 
        ? sourceId - 1 
        : sourceId + 1;
    // check if a valid targetID was derived
    if (this.layers[targetId] !== undefined) {
      // swap the elements
      [this.layers[sourceId], this.layers[targetId]] = [this.layers[targetId], this.layers[sourceId]];
      // swap the corresponding controls, too
      const sourceControl = this.controlsArea.children[sourceId];
      const targetControl = this.controlsArea.children[targetId];

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
      this.calculateDefaultAppliedMaskLayers(this.layers[targetId].id);
      this.calculateDefaultAppliedMaskLayers(this.layers[sourceId].id);
    }
    this.redraw(true);
  }

  centerLayer(id) {
    this.resetLayer(id);
  }

  resetLayer(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      layer.reset();
      this.redraw(true);
    }
  }

  setBlendMode(id, blendMode, isMask) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      if (isMask) layer.maskCompositeOperation = blendMode;
      else layer.compositeOperation = blendMode;
      this.redraw(true);
    }
  }

  mirrorLayer(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      layer.flip();
      this.redraw();
    }
  }

  setOpacity(id, opacity) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      layer.alpha = parseInt(opacity) / 100;
      layer.redraw();
      this.redraw();
    }
  }

  setLayerVisibility(id) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      layer.visible = !layer.visible;
      this.redraw();
    }
  }

  /**
   * Activates a layer for translation/scaling
   * @param Number | null id of the layer that should activate it's mask, if null: Activate the lowest layer with id = 0
   */
  activateLayer(id = 0) {
    // set all layers to inactive
    this.layers.forEach((layer) => (layer.active = false));
    this.activeLayer = this.layers.find((layer) => layer.id === id);
    // activate the layer with given id
    if (this.activeLayer !== null) {
      this.activeLayer.active = true;
    }
    this.redraw();
  }

  /**
   * Deactives all layers (can only be one active at a time...)
   */
  deactivateLayers() {
    this.activeLayer = null;
    this.layers.forEach((layer) => (layer.active = false));
    this.redraw();
  }

  calculateDefaultAppliedMaskLayers(id) {
    const layer = this.layers.find((l) => l.id === id);
    const index = this.layers.findIndex((l) => l.id === id);

    logger.debug(`Adding mask ids to layer ${index} (${id})`, layer);
    if (layer && !layer.customMaskLayers) {
      this.layers.forEach((l) => {
        if (l.providesMask && this.isOriginLayerHigher(l.id, id)) {
          logger.debug(`Applying id ${l.id}`);
          layer.appliedMaskIds.add(l.id);
        } else {
          logger.debug(`Deleting id ${l.id}`);
          layer.appliedMaskIds.delete(l.id);
        }
      });
    }
  }

  calculateAllDefaultMaskLayers() {
    this.layers.forEach((layer) => {
      this.calculateDefaultAppliedMaskLayers(layer.id);
    });
  }

  /**
   * Activates the mask with the given id
   * @param Number | null id of the layer that should activate it's mask, if null: Activate the lowest layer with id = 0
   */
  activateMask(id = 0) {
    logger.debug(`Toggling layer ${id} active mask`);
    // reset existing mask provision
    const layer = this.layers.find((layer) => layer.id === id);

    if (layer) {
      // check if this layer currently provides the mask
      if (layer.providesMask === true) {
        layer.providesMask = false;
        this.maskIds.delete(id);
      } else {
        layer.createMask();
        layer.redraw();
        this.maskIds.add(id);
        layer.providesMask = true;
      }

      this.calculateAllDefaultMaskLayers();
    }

    this.redraw(true);
    return true;
  }

  customMaskLayerToggle(id, maskLayerId) {
    logger.debug(`Toggling custom mask layers for ${id} layer and mask ${maskLayerId}`);
    const layer = this.layers.find((l) => l.id === id);
    if (layer) {
      layer.customMaskLayers = true;

      if (layer.appliedMaskIds.has(maskLayerId)) {
        layer.appliedMaskIds.delete(maskLayerId);
      } else {
        layer.appliedMaskIds.add(maskLayerId);
      }
    }
    this.redraw(true);
  }

  editMask(id) {
    logger.debug(`Editing mask for layer ${id}`);
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.editMask(this.redraw.bind(this));
      this.deactivateLayers();
      this.controls.forEach((control) => control.refresh());
    }
  }

  magicLasso(id) {
    logger.debug(`Magic Lasso for layer ${id}`);
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer) {
      layer.magicLasso(this.redraw.bind(this));
      this.deactivateLayers();
      this.controls.forEach((control) => control.refresh());
    }
  }

  // eslint-disable-next-line default-param-last
  setColor(id = 0, hexColorString) {
    const layer = this.layers.find((layer) => layer.id === id);
    if (layer !== null) {
      logger.debug('Setting color for layer', { layer, hexColorString });
      layer.setColor(hexColorString);
      this.redraw(true);
    }
  }

  redraw(full = false) {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.width, this.height);

    if (full) {
      logger.debug("Full redraw triggered");
      this.layers.forEach((layer) => {
        logger.debug(`Recalculating mask for ${layer.id}`, layer);
        layer.recalculateMask();
      });
      this.layers.forEach((layer) => {
        logger.debug(`Recalculating visual layer for ${layer.id}`, layer);
        layer.redraw();
      });
    }

    // loop through each layer, and apply the layer to the canvas
    for (let index = this.layers.length - 1; index >= 0; index--) {
      const layer = this.layers[index];
      if (layer.visible) {
        const imgSrc = Utils.isString(layer.sourceImg) && !layer.sourceImg.startsWith("data:image/png;base64")
          ? layer.sourceImg
          : "blob-data";
        logger.debug(`Drawing layer ${layer.id} for ${imgSrc}`);

        context.globalCompositeOperation = layer.compositeOperation;
        context.globalAlpha = layer.alpha;

        context.drawImage(
          layer.canvas,
          0,
          0,
          layer.canvas.width,
          layer.canvas.height,
          0,
          0,
          this.width,
          this.height,
        );
      }
    }
  }
}

import CONSTANTS from "../constants.js";

export default class Control {

  toggleVisibleDiv(button, element) {
    // this.tokenizer.activeLayerSelectorElement currently selected selector
    // this.tokenizer.lastControlButtonClicked the last clicked selector button

    // cases
    // selector button clicked, show selector
    // selector button clicked, dismiss selector
    // - clicked back on button after selector dismissed by button click
    // clicked inside selector, nothing
    // clicked outside selector, dismiss selector
    // - clicked back on button after selector dismissed by outside click
    // click on another button, dismiss selector, show new selector

    element.classList.toggle("show");
    this.tokenizer.lastControlButtonClicked = button;
    this.tokenizer.activeLayerSelectorElement = element.classList.contains("show")
      ? element
      : null;
  }


  view = document.createElement('div');

  idNumber = document.createElement("div");

  maskControl = document.createElement('button');

  maskManagementSection = document.createElement('div');

  maskLayerSelector = document.createElement("div");

  positionManagementSection = document.createElement('div');

  visibleControl = document.createElement('button');

  activeControl = document.createElement('button');

  deleteSection = document.createElement('div');

  colorManagementSection = document.createElement('div');

  colorSelector = document.createElement('input');

  colorSelectorProxy = document.createElement('div');

  clearColor = document.createElement('button');

  getColor = document.createElement('button');

  moveManagementSection = document.createElement('div');

  moveUpControl = document.createElement('button');

  moveDownControl = document.createElement('button');

  adjustmentManagementSection = document.createElement('div');

  colorSelectionManagementSection = document.createElement('div');

  colorBoxSpan = document.createElement('div');

  getAlpha = document.createElement('button');

  colorTintSelectorProxy = document.createElement('div');

  clearColorTint = document.createElement('button');

  tintControlsDiv = document.createElement('div');

  alphaSelectorProxy = document.createElement('div');

  deleteControl = document.createElement('button');

  opacitySliderControl = document.createElement('input');

  opacityLabel = document.createElement('div');

  brightnessSliderControl = document.createElement('input');

  brightnessLabel = document.createElement('div');

  contrastSliderControl = document.createElement('input');

  contrastLabel = document.createElement('div');

  lineArtBlurSizeControl = document.createElement('input');

  lineArtBlurSizeLabel = document.createElement('div');

  lineArtEnableButton = document.createElement('input');

  constructor(tokenizer, layer) {
    this.tokenizer = tokenizer;
    this.layer = layer;

    this.view.setAttribute('data-layer', this.layer.id);
    this.view.classList.add('view-layer-control');

    const idSection = document.createElement("div");
    idSection.name = "layer-id-num";
    idSection.title = game.i18n.localize("vtta-tokenizer.label.LayerNumber");
    idSection.classList.add("section", "number");
    this.idNumber.innerHTML = this.layer.getLayerLabel();

    let previewSection = document.createElement('div');
    previewSection.name = 'preview';
    previewSection.classList.add('section');

    let previewMaskSection = document.createElement('div');
    previewMaskSection.name = 'previewMask';
    previewMaskSection.classList.add('section');

    this.#configureColorManagement();
    this.#configureMaskManagementSection();
    this.#configureTranslationControls();
    this.#configureAdjustmentSection();
    this.#configureMagicLassoSection();
    this.#configureMovementSection();
    this.#configureDeletionSection();

    // push all elements to the control's view
    this.view.appendChild(idSection);
    idSection.appendChild(this.idNumber);
    this.view.appendChild(previewSection);
    previewSection.appendChild(this.layer.preview);
    this.view.appendChild(previewMaskSection);
    previewMaskSection.appendChild(this.layer.renderedMask);
    this.view.appendChild(this.maskManagementSection);
    if (this.layer.colorLayer) {
      this.view.appendChild(this.colorManagementSection);
      this.colorManagementSection.appendChild(this.visibleControl);
      this.colorManagementSection.appendChild(this.colorSelector);
      this.colorManagementSection.appendChild(this.colorSelectorProxy);
      this.colorManagementSection.appendChild(this.clearColor);
      this.colorManagementSection.appendChild(this.getColor);
      this.colorManagementSection.appendChild(this.adjustmentManagementSection);
      this.maskControl.disabled = true;
    } else {
      this.view.appendChild(this.positionManagementSection);
      this.positionManagementSection.appendChild(this.visibleControl);
      this.positionManagementSection.appendChild(this.activeControl);
      this.positionManagementSection.appendChild(this.colorSelectionManagementSection);
      this.positionManagementSection.appendChild(this.adjustmentManagementSection);
      this.positionManagementSection.appendChild(this.layerMovementControl);
    }
    this.view.appendChild(this.moveManagementSection);
    this.view.appendChild(this.deleteSection);
  }

  #configureMaskManagementSection() {
    this.maskManagementSection.name = 'mask-management';
    this.maskManagementSection.classList.add('section');
    let maskManagementTitle = document.createElement('span');
    maskManagementTitle.innerHTML = 'Masks';
    this.maskManagementSection.appendChild(maskManagementTitle);

    // Set the basic mask of this layer
    this.maskControl.classList.add('mask-control', 'popup-button');
    this.maskControl.title = game.i18n.localize("vtta-tokenizer.label.ToggleBasicMask");
    let maskButtonText = document.createElement('i');
    maskButtonText.classList.add('fas', 'fa-mask');
    this.maskControl.appendChild(maskButtonText);

    // send a mask event when clicked
    this.maskControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('mask', { detail: { layerId: this.layer.id } }));
    });

    // Set the mask of this layer
    let maskEditControl = document.createElement('button');
    maskEditControl.classList.add('mask-control', 'popup-button');
    // maskEditControl.disabled = true;
    maskEditControl.title = game.i18n.localize("vtta-tokenizer.label.EditMask");
    let maskEditButtonText = document.createElement('i');
    maskEditButtonText.classList.add('fas', 'fa-pencil');
    maskEditControl.appendChild(maskEditButtonText);

    // send a mask event when clicked
    maskEditControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('edit-mask', { detail: { layerId: this.layer.id } }));
    });

    // Set the mask of this layer
    let maskResetControl = document.createElement('button');
    maskResetControl.classList.add('popup-button');
    maskResetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetMasks");
    let maskResetButtonText = document.createElement('i');
    maskResetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    maskResetControl.appendChild(maskResetButtonText);

    maskResetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset-mask-layer', { detail: { layerId: this.layer.id } }));
    });

    let masksControl = document.createElement('button');
    masksControl.classList.add('blend-control');
    masksControl.title = game.i18n.localize("vtta-tokenizer.label.AdvancedMaskApplication");

    let masksButtonText = document.createElement('i');
    masksButtonText.classList.add('fas', 'fa-masks-theater');
    masksControl.appendChild(masksButtonText);

    let maskSelectorSpan = document.createElement('div');
    maskSelectorSpan.classList.add('popup');

    this.maskLayerSelector.classList.add("popup-selector");

    this.#addSelectLayerMasks();
    let basicMaskControls = document.createElement('div');
    basicMaskControls.classList.add('basic-control');
    basicMaskControls.appendChild(this.maskControl);
    basicMaskControls.appendChild(maskEditControl);
    basicMaskControls.appendChild(maskResetControl);
    
    maskSelectorSpan.appendChild(basicMaskControls);
    maskSelectorSpan.appendChild(this.maskLayerSelector);

    let blendControlImage = document.createElement('select');
    blendControlImage.classList.add('blend-control-image');
    let blendControlMask = document.createElement('select');
    blendControlMask.classList.add('blend-control-mask');

    [blendControlMask, blendControlImage].forEach((blendControlElement) => {
      blendControlElement.classList.add('blend-control-selector');
      for (const mode of Object.values(CONSTANTS.BLEND_MODES)) {
        const option = document.createElement('option');
        option.value = mode;
        option.innerHTML = mode;
        if ((blendControlElement.classList.contains("blend-control-image") && mode === this.layer.compositeOperation)
          || (blendControlElement.classList.contains("blend-control-mask") && mode === this.layer.maskCompositeOperation)) {
          option.selected = true;
        }
        blendControlElement.append(option);
      }
  
      blendControlElement.addEventListener('change', (event) => {
        event.preventDefault();
        this.view.dispatchEvent(new CustomEvent('blend', {
          detail: {
            layerId: this.layer.id,
            image: blendControlElement.classList.contains("blend-control-image"),
            mask: blendControlElement.classList.contains("blend-control-mask"),
            blendMode: event.target.value,
          },
        }));
      });
  
    });

    let blendImageDiv = document.createElement('div');
    let blendImageText = document.createElement('i');
    blendImageText.title = game.i18n.localize("vtta-tokenizer.label.ImageBlendMode");
    blendImageText.classList.add('fas', 'fa-image');
    blendImageDiv.appendChild(blendImageText);
    blendImageDiv.appendChild(blendControlImage);
    maskSelectorSpan.appendChild(blendImageDiv);

    let blendMaskDiv = document.createElement('div');
    let blendMaskText = document.createElement('i');
    blendMaskText.title = game.i18n.localize("vtta-tokenizer.label.MaskBlendMode");
    blendMaskText.classList.add('fas', 'fa-mask');
    blendMaskDiv.appendChild(blendMaskText);
    blendMaskDiv.appendChild(blendControlMask);
    maskSelectorSpan.appendChild(blendMaskDiv);

    // send an activate event when clicked
    masksControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(masksControl, maskSelectorSpan);
    }, true);

    // blend mode controls
    let blendManagementSection = document.createElement('div');
    blendManagementSection.appendChild(masksControl);
    blendManagementSection.appendChild(maskSelectorSpan);
    this.maskManagementSection.appendChild(blendManagementSection);
  }

  #configureTranslationControls() {
    // position management section
    this.positionManagementSection.name = 'position-management';
    this.positionManagementSection.classList.add('section');
    let positionManagementTitle = document.createElement('span');
    positionManagementTitle.innerHTML = game.i18n.localize("vtta-tokenizer.label.Transform");
    this.positionManagementSection.appendChild(positionManagementTitle);

    // is this layer visible?
    this.visibleControl.classList.add('visible-layer');
    this.visibleControl.title = game.i18n.localize("vtta-tokenizer.label.VisibleLayer");

    let visibleButtonText = document.createElement('i');
    visibleButtonText.classList.add('fas', 'fa-eye');
    this.visibleControl.appendChild(visibleButtonText);

    // send a mask event when clicked
    this.visibleControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('visible', { detail: { layerId: this.layer.id } }));
    });

    // Makes the layer active for translating/ scaling
    this.activeControl.title = game.i18n.localize("vtta-tokenizer.label.EnableDisableTransformation");
    this.activeControl.classList.add('mask-control');
    let activeButtonText = document.createElement('i');
    activeButtonText.classList.add('fas', 'fa-lock');
    this.activeControl.appendChild(activeButtonText);

    // send an activate event when clicked
    this.activeControl.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.activeControl.classList.contains('active')) {
        this.view.dispatchEvent(new CustomEvent('deactivate', { detail: { layerId: this.layer.id } }));
      } else {
        this.view.dispatchEvent(new CustomEvent('activate', { detail: { layerId: this.layer.id } }));
      }
    });

    // Makes flips the layer
    let flipControl = document.createElement('button');
    flipControl.title = game.i18n.localize("vtta-tokenizer.label.FlipLayer");
    flipControl.classList.add('flip-control', 'popup-button');
    let flipButtonText = document.createElement('i');
    flipButtonText.classList.add('fas', 'fa-people-arrows');
    flipControl.appendChild(flipButtonText);

    // send an activate event when clicked
    flipControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('flip', { detail: { layerId: this.layer.id } }));
    });

    // resets the layer on the view
    let resetControl = document.createElement('button');
    resetControl.classList.add('reset-control', 'popup-button');
    resetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetLayer");
    let resetButtonText = document.createElement('i');
    resetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    resetControl.appendChild(resetButtonText);

    // send an activate event when clicked
    resetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset', { detail: { layerId: this.layer.id } }));
    });

    // Centres the layer
    let centreLayerControl = document.createElement('button');
    centreLayerControl.title = game.i18n.localize("vtta-tokenizer.label.CentreLayer");
    centreLayerControl.classList.add('centre-control', 'popup-button');
    let centreLayerText = document.createElement('i');
    centreLayerText.classList.add('fas', 'fa-crosshairs');
    centreLayerControl.appendChild(centreLayerText);

    // send an activate event when clicked
    centreLayerControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('centre-layer', { detail: { layerId: this.layer.id } }));
    });

    // Layer movement selector
    let layerMovementSelectorDiv = document.createElement('div');
    layerMovementSelectorDiv.classList.add('popup');

    // Layer movement controls
    let layerMovementControl = document.createElement('button');
    layerMovementControl.title = game.i18n.localize("vtta-tokenizer.label.LayerMovementControls");
    layerMovementControl.classList.add('layer-movement-control');
    let layerMovementText = document.createElement('i');
    layerMovementText.classList.add('fas', 'fa-toolbox');
    layerMovementControl.appendChild(layerMovementText);

    layerMovementControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(this.layerMovementControl, layerMovementSelectorDiv);
    }, true);

    let buttonDiv = document.createElement("div");
    buttonDiv.classList.add("popup-selector");

    buttonDiv.appendChild(flipControl);
    buttonDiv.appendChild(centreLayerControl);
    buttonDiv.appendChild(resetControl);

    layerMovementSelectorDiv.appendChild(buttonDiv);
    layerMovementSelectorDiv.appendChild(document.createElement('hr'));

    let scaleDiv = document.createElement('div');
    scaleDiv.classList.add("popup-selector");

    let scaleInput = document.createElement('input');
    scaleInput.type = "text";
    scaleInput.value = `${this.layer.scale * 100}`;
    scaleInput.classList.add('scale-input', 'popup-input');

    let scaleControl = document.createElement('button');
    scaleControl.title = game.i18n.localize("vtta-tokenizer.label.ScaleButton");
    scaleControl.classList.add('scale-control', 'popup-button');
    let scaleText = document.createElement('i');
    scaleText.classList.add('fas', 'fa-compress');
    scaleControl.appendChild(scaleText);

    scaleControl.addEventListener("click", (event) => {
      event.preventDefault();
      const percentage = parseFloat(scaleInput.value);
      if (isNaN(percentage)) {
        scaleInput.value = `${this.layer.scale * 100}`;
      } else {
        this.view.dispatchEvent(new CustomEvent('scale-layer', { detail: { layerId: this.layer.id, percent: percentage } }));
      }
    });

    scaleDiv.appendChild(scaleInput);
    scaleDiv.appendChild(scaleControl);

    layerMovementSelectorDiv.appendChild(scaleDiv);

    let wrapperDiv = document.createElement("div");
    wrapperDiv.appendChild(layerMovementControl);
    wrapperDiv.appendChild(layerMovementSelectorDiv);
    
    this.layerMovementControl = wrapperDiv;
  }

  #configureDeletionSection() {
    this.deleteSection.name = 'delete-management';
    this.deleteSection.classList.add('section');

    // duplicate
    let duplicateControl = document.createElement('button');
    duplicateControl.classList.add('duplicate-control');
    duplicateControl.title = game.i18n.localize("vtta-tokenizer.label.CloneLayer");
    let duplicateButtonText = document.createElement('i');
    duplicateButtonText.classList.add('fas', 'fa-clone');
    duplicateControl.appendChild(duplicateButtonText);

    duplicateControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('duplicate', {
          detail: { layerId: this.layer.id },
        }),
      );
    });

    // delete
    this.deleteControl.classList.add('delete-control');
    this.deleteControl.title = game.i18n.localize("vtta-tokenizer.label.DeleteLayer");
    let deleteButtonText = document.createElement('i');
    deleteButtonText.classList.add('fas', 'fa-trash-alt');
    this.deleteControl.appendChild(deleteButtonText);

    this.deleteControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('delete', {
          detail: { layerId: this.layer.id },
        }),
      );
    });

    this.deleteSection.appendChild(duplicateControl);
    this.deleteSection.appendChild(this.deleteControl);
  }

  #configureColorManagement() {
    this.colorManagementSection.name = 'color-management';
    this.colorManagementSection.classList.add('section');
    let colorManagementTitle = document.createElement('span');
    colorManagementTitle.innerHTML = game.i18n.localize("vtta-tokenizer.label.Color");
    this.colorManagementSection.appendChild(colorManagementTitle);

    // the color picker element, which is hidden
    this.colorSelector.type = 'color';
    this.colorSelector.value = '#00000FF';

    // a nicer looking proxy for the color picker
    this.colorSelectorProxy.title = game.i18n.localize("vtta-tokenizer.label.EditTint");
    this.colorSelectorProxy.classList.add('color-picker', 'transparent');
    this.colorSelectorProxy.addEventListener("click", () => {
      this.colorSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    this.colorSelector.addEventListener('change', (event) => {
      this.colorSelectorProxy.style.backgroundColor = event.target.value;
      this.colorSelectorProxy.classList.remove('transparent');
      this.view.dispatchEvent(
        new CustomEvent('color', {
          detail: { layerId: this.layer.id, color: event.target.value },
        }),
      );
    });

    // ability to clear the color of the layer
    this.clearColor.disabled = true;
    this.clearColor.classList.add('danger');
    this.clearColor.title = game.i18n.localize("vtta-tokenizer.label.ClearTint");
    let clearButtonText = document.createElement('i');
    clearButtonText.classList.add('fas', 'fa-minus-circle');
    this.clearColor.appendChild(clearButtonText);

    this.clearColor.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('color', {
          detail: { layerId: this.layer.id, color: null },
        }),
      );
    });

    // get color from canvas
    this.getColor.title = game.i18n.localize("vtta-tokenizer.label.PickTint");
    let colorButtonText = document.createElement('i');
    colorButtonText.classList.add('fas', 'fa-eye-dropper');
    this.getColor.appendChild(colorButtonText);

    // dispatch the request for color picking
    this.getColor.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.getColor.classList.contains('active')) {
        this.getColor.classList.remove('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-color-end', {
            detail: { layerId: this.layer.id },
          }),
        );
      } else {
        this.getColor.classList.add('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-color-start', {
            detail: { layerId: this.layer.id },
          }),
        );
      }
    });
  }

  #configureMovementSection() {
    this.moveManagementSection.classList.add('move-control');
    this.moveManagementSection.name = 'move-management';
    this.moveManagementSection.classList.add('section');

    // moving up
    this.moveUpControl.classList.add('move-control', 'move-up');
    this.moveUpControl.title = game.i18n.localize("vtta-tokenizer.label.MoveLayerUp");
    let moveUpButtonText = document.createElement('i');
    moveUpButtonText.classList.add('fas', 'fa-caret-up');
    this.moveUpControl.appendChild(moveUpButtonText);

    // moving up event dispatcher
    this.moveUpControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('move', {
          detail: { layerId: this.layer.id, direction: 'up' },
        }),
      );
    });

    // moving down
    this.moveDownControl.classList.add('move-control', 'move-down');
    this.moveDownControl.title = game.i18n.localize("vtta-tokenizer.label.MoveLayerDown");
    let moveDownButtonText = document.createElement('i');
    moveDownButtonText.classList.add('fas', 'fa-caret-down');
    this.moveDownControl.appendChild(moveDownButtonText);

    // moving down event dispatcher
    this.moveDownControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('move', {
          detail: { layerId: this.layer.id, direction: 'down' },
        }),
      );
    });
    this.moveManagementSection.appendChild(this.moveUpControl);
    this.moveManagementSection.appendChild(this.moveDownControl);

  }

  #configureAdjustmentSection() {
    let adjustmentSelectionControl = document.createElement('button');
    adjustmentSelectionControl.classList.add('adjustment-control');
    adjustmentSelectionControl.title = game.i18n.localize("vtta-tokenizer.label.Adjustments");

    let adjustmentsButtonText = document.createElement('i');
    adjustmentsButtonText.classList.add('fas', 'fa-hammer-brush');
    adjustmentSelectionControl.appendChild(adjustmentsButtonText);
    this.adjustmentManagementSection.appendChild(adjustmentSelectionControl);

    let adjustmentControlsSpan = document.createElement('div');
    adjustmentControlsSpan.classList.add('popup');

    // send an activate event when clicked
    adjustmentSelectionControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(adjustmentSelectionControl, adjustmentControlsSpan);
    }, true);

    // opacity controls
    let opacitySliderSpan = document.createElement('div');
    opacitySliderSpan.classList.add('basic-control');
    let opacityIcon = document.createElement('i');
    opacityIcon.classList.add('fa-duotone', 'fa-solid', 'fa-face-dotted');
    opacityIcon.title = game.i18n.localize("vtta-tokenizer.label.Opacity");
    opacitySliderSpan.appendChild(opacityIcon);

    this.opacitySliderControl.type = 'range';
    this.opacitySliderControl.min = 0;
    this.opacitySliderControl.max = 100;
    this.opacitySliderControl.value = (this.layer.alpha ?? 1) * 100;
    this.opacitySliderControl.title = game.i18n.localize("vtta-tokenizer.label.Opacity");
    this.opacitySliderControl.name = "opacity";

    this.opacityLabel.innerHTML = `${this.opacitySliderControl.value}%`;

    this.opacitySliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        opacity: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('opacity', { detail }));
      this.opacityLabel.innerHTML = `${event.target.value}%`;
    });

    opacitySliderSpan.appendChild(this.opacitySliderControl);
    opacitySliderSpan.appendChild(this.opacityLabel);

    adjustmentControlsSpan.appendChild(opacitySliderSpan);
    adjustmentControlsSpan.appendChild(document.createElement('hr'));

    // brightness controls
    let brightnessSliderSpan = document.createElement('div');
    brightnessSliderSpan.classList.add('basic-control');
    let brightnessIcon = document.createElement('i');
    brightnessIcon.classList.add('fa-solid', 'fa-brightness');
    brightnessIcon.title = game.i18n.localize("vtta-tokenizer.label.Brightness");
    brightnessSliderSpan.appendChild(brightnessIcon);

    this.brightnessSliderControl.type = 'range';
    this.brightnessSliderControl.min = -100;
    this.brightnessSliderControl.max = 100;
    this.brightnessSliderControl.value = this.layer.brightness ?? 0;
    this.brightnessSliderControl.title = game.i18n.localize("vtta-tokenizer.label.Brightness");
    this.brightnessSliderControl.name = "brightness";

    this.brightnessLabel.innerHTML = `${this.brightnessSliderControl.value}%`;

    this.brightnessSliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        brightness: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('brightness', { detail }));
      this.brightnessLabel.innerHTML = `${event.target.value ?? 0}%`;
    });
    brightnessSliderSpan.appendChild(this.brightnessSliderControl);
    brightnessSliderSpan.appendChild(this.brightnessLabel);

    adjustmentControlsSpan.appendChild(brightnessSliderSpan);
    adjustmentControlsSpan.appendChild(document.createElement('hr'));

    // contrast controls
    let contrastSliderSpan = document.createElement('div');
    contrastSliderSpan.classList.add('basic-control');
    let contrastIcon = document.createElement('i');
    contrastIcon.classList.add('fa-solid', 'fa-circle-half-stroke');
    contrastIcon.title = game.i18n.localize("vtta-tokenizer.label.Contrast");
    contrastSliderSpan.appendChild(contrastIcon);

    this.contrastSliderControl.type = 'range';
    this.contrastSliderControl.min = -100;
    this.contrastSliderControl.max = 100;
    this.contrastSliderControl.value = this.layer.contrast ?? 0;
    this.contrastSliderControl.title = game.i18n.localize("vtta-tokenizer.label.Contrast");
    this.contrastSliderControl.name = "contrast";

    this.contrastLabel.innerHTML = `${this.contrastSliderControl.value}%`;

    this.contrastSliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        contrast: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('contrast', { detail }));
      this.contrastLabel.innerHTML = `${event.target.value}%`;
    });
    contrastSliderSpan.appendChild(this.contrastSliderControl);

    contrastSliderSpan.appendChild(this.contrastLabel);

    adjustmentControlsSpan.appendChild(contrastSliderSpan);
    adjustmentControlsSpan.appendChild(document.createElement('hr'));

    // line art brush size
    let lineArtBlurSizeSpan = document.createElement('div');
    lineArtBlurSizeSpan.classList.add('basic-control');
    let lineArtBlurSizeIcon = document.createElement('i');
    lineArtBlurSizeIcon.classList.add('fa-solid', 'fa-paint-brush');
    lineArtBlurSizeIcon.title = game.i18n.localize("vtta-tokenizer.label.LineArtBlurSize");
    lineArtBlurSizeSpan.appendChild(lineArtBlurSizeIcon);

    let lineArtEnabled = this.layer.filters.some((f) => f.name === "lineArtEffect");

    this.lineArtBlurSizeControl.type = 'range';
    this.lineArtBlurSizeControl.min = 1;
    this.lineArtBlurSizeControl.max = 50;
    this.lineArtBlurSizeControl.value = this.layer.lineArtBlurSize ?? 25;
    this.lineArtBlurSizeControl.title = game.i18n.localize("vtta-tokenizer.label.LineArtBlurSize");
    this.lineArtBlurSizeControl.name = "line-art-blur-size";
    this.lineArtBlurSizeControl.disabled = !lineArtEnabled;

    this.lineArtBlurSizeLabel.innerHTML = `${this.lineArtBlurSizeControl.value}px`;

    this.lineArtEnableButton.type = 'checkbox';
    this.lineArtEnableButton.checked = lineArtEnabled;
    this.lineArtEnableButton.title = game.i18n.localize("vtta-tokenizer.label.EnableLineArt");

    this.lineArtEnableButton.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        enable: event.target.checked,
      };
      this.lineArtBlurSizeControl.disabled = !event.target.checked;
      this.view.dispatchEvent(new CustomEvent('line-art-toggle', { detail }));
    });

    this.lineArtBlurSizeControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        size: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('line-art-blur-size', { detail }));
      this.lineArtBlurSizeLabel.innerHTML = `${event.target.value}px`;
    });
    lineArtBlurSizeSpan.appendChild(this.lineArtBlurSizeControl);
    lineArtBlurSizeSpan.appendChild(this.lineArtBlurSizeLabel);
    lineArtBlurSizeSpan.appendChild(this.lineArtEnableButton);

    adjustmentControlsSpan.appendChild(lineArtBlurSizeSpan);

    this.adjustmentManagementSection.appendChild(adjustmentControlsSpan);

    // add section for adjusting brightness

    // add section for adjusting contrast
  }

  #configureMagicLassoSection() {
    let colorSelectionControl = document.createElement('button');
    colorSelectionControl.classList.add('color-selection-control');
    colorSelectionControl.title = game.i18n.localize("vtta-tokenizer.label.ColorChangeControl");

    let buttonText = document.createElement('i');
    buttonText.classList.add('fa-thin', 'fa-eye-dropper', 'fa-regular');
    colorSelectionControl.appendChild(buttonText);
    this.colorSelectionManagementSection.appendChild(colorSelectionControl);

    this.colorBoxSpan.classList.add('popup');

    // send an activate event when clicked
    colorSelectionControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(colorSelectionControl, this.colorBoxSpan);
    }, true);

    let colorThresholdSliderControl = document.createElement('input');
    colorThresholdSliderControl.type = 'range';
    colorThresholdSliderControl.min = 0;
    colorThresholdSliderControl.max = 150;
    colorThresholdSliderControl.value = 15;
    colorThresholdSliderControl.title = game.i18n.localize("vtta-tokenizer.label.ColorThreshold");
    colorThresholdSliderControl.name = "color-threshold";

    colorThresholdSliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        tolerance: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('transparency-level', { detail }));
    });

    // get color from canvas
    this.getAlpha.classList.add('popup-button');
    this.getAlpha.title = game.i18n.localize("vtta-tokenizer.label.PickAlpha");
    let alphaButtonText = document.createElement('i');
    alphaButtonText.classList.add('fa-thin', 'fa-eye-dropper', 'fa-regular');
    this.getAlpha.appendChild(alphaButtonText);

    // dispatch the request for color picking
    this.getAlpha.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.getAlpha.classList.contains('active')) {
        this.getAlpha.classList.remove('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-alpha-end', {
            detail: { layerId: this.layer.id },
          }),
        );
      } else {
        this.getAlpha.classList.add('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-alpha-start', {
            detail: { layerId: this.layer.id },
          }),
        );
      }
    });

    this.alphaSelectorProxy.classList.add('color-picker', 'transparent');

    let transparencyResetControl = document.createElement('button');
    transparencyResetControl.classList.add('popup-button');
    transparencyResetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetColorTransparency");
    let resetButtonText = document.createElement('i');
    resetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    transparencyResetControl.appendChild(resetButtonText);

    transparencyResetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset-transparency-level', { detail: { layerId: this.layer.id } }));
    });

    // get color from canvas
    let magicLassoControl = document.createElement('button');
    magicLassoControl.classList.add('popup-button');
    magicLassoControl.title = game.i18n.localize("vtta-tokenizer.label.MagicLasso");
    let magicLassoButtonText = document.createElement('i');
    magicLassoButtonText.classList.add('fa-thin', 'fa-lasso-sparkles', 'fa-regular');
    magicLassoControl.appendChild(magicLassoButtonText);

    magicLassoControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('magic-lasso', { detail: { layerId: this.layer.id } }));
    });


    let lassoControls = document.createElement('div');
    lassoControls.classList.add('basic-control');
    lassoControls.appendChild(magicLassoControl);

    this.#tintControls();

    let transparencyControls = document.createElement('div');
    transparencyControls.classList.add('basic-control');
    transparencyControls.appendChild(this.alphaSelectorProxy);
    transparencyControls.appendChild(this.getAlpha);
    transparencyControls.appendChild(transparencyResetControl);

    this.colorBoxSpan.appendChild(lassoControls);
    this.colorBoxSpan.appendChild(document.createElement('hr'));
    this.colorBoxSpan.appendChild(this.tintControlsDiv);
    this.colorBoxSpan.appendChild(document.createElement('hr'));
    this.colorBoxSpan.appendChild(transparencyControls);
    this.colorBoxSpan.appendChild(colorThresholdSliderControl);
    this.colorSelectionManagementSection.appendChild(this.colorBoxSpan);
  }

  #tintControls() {
    // the color picker element, which is hidden
    let colorTintSelector = document.createElement('input');
    colorTintSelector.type = 'color';
    colorTintSelector.value = '#00000FF';

    // a nicer looking proxy for the color picker
    this.colorTintSelectorProxy.title = game.i18n.localize("vtta-tokenizer.label.EditLayerTint");
    this.colorTintSelectorProxy.classList.add('color-picker', 'transparent');
    this.colorTintSelectorProxy.addEventListener("click", () => {
      colorTintSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    colorTintSelector.addEventListener('change', (event) => {
      this.colorTintSelectorProxy.style.backgroundColor = event.target.value;
      this.colorTintSelectorProxy.classList.remove('transparent');
      this.view.dispatchEvent(
        new CustomEvent('color-tint', {
          detail: { layerId: this.layer.id, color: event.target.value },
        }),
      );
    });

    // ability to clear the color of the layer
    this.clearColorTint.disabled = true;
    this.clearColorTint.classList.add('danger', 'popup-button');
    this.clearColorTint.title = game.i18n.localize("vtta-tokenizer.label.ClearTint");
    let clearButtonText = document.createElement('i');
    clearButtonText.classList.add('fas', 'fa-minus-circle');
    this.clearColorTint.appendChild(clearButtonText);

    this.clearColorTint.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('color-tint', {
          detail: { layerId: this.layer.id, color: null },
        }),
      );
    });

    this.tintControlsDiv.classList.add('basic-control');
    this.tintControlsDiv.appendChild(colorTintSelector);
    this.tintControlsDiv.appendChild(this.colorTintSelectorProxy);
    this.tintControlsDiv.appendChild(this.clearColorTint);
  }

  #addSelectLayerMasks() {
    this.maskLayerSelector.innerHTML = "";
    this.layer.view.layers.forEach((layer) => {
      const layerIdDiv = document.createElement("div");
      const active = this.layer.appliedMaskIds.has(layer.id);
      const layerNum = this.layer.view.layers.findIndex((l) => l.id === layer.id);

      const button = document.createElement('button');
      button.classList.add('popup-choice');
      if (active) button.classList.add('active');
      button.title = game.i18n.format("vtta-tokenizer.label.ToggleLayer", { layerNum });
      button.innerHTML = layer.getLayerLabel(active);

      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.view.dispatchEvent(
          new CustomEvent('mask-layer', {
            detail: { layerId: this.layer.id, maskLayerId: layer.id },
          }),
        );
      });

      layerIdDiv.appendChild(button);
      this.maskLayerSelector.appendChild(layerIdDiv);
    });
  }

  refresh() {
    this.idNumber.innerHTML = this.layer.getLayerLabel();
    // is this layer providing the mask for the view?
    if (this.layer.customMaskLayers) {
      this.maskControl.classList.remove('active');
      this.maskControl.disabled = true;
    } else if (this.layer.providesMask) {
      this.maskControl.classList.add('active');
      // this.maskEditControl.disabled = false;
    } else {
      this.maskControl.classList.remove('active');
      // this.maskEditControl.disabled = true;
    }

    this.maskLayerSelector.innerHTML = "";
    this.#addSelectLayerMasks();

    // is this layer visible
    if (this.layer.visible) {
      this.visibleControl.classList.add('active');
      this.visibleControl.firstChild.classList.remove('fa-eye-slash');
      this.visibleControl.firstChild.classList.add('fa-eye');
    } else {
      this.visibleControl.classList.remove('active');
      this.visibleControl.firstChild.classList.remove('fa-eye');
      this.visibleControl.firstChild.classList.add('fa-eye-slash');
    }

    // is this layer active?
    if (this.layer.active) {
      this.activeControl.classList.add('active');
      this.activeControl.firstChild.classList.remove('fa-lock');
      this.activeControl.firstChild.classList.add('fa-lock-open');
    } else {
      this.activeControl.classList.remove('active');
      this.activeControl.firstChild.classList.remove('fa-lock-open');
      this.activeControl.firstChild.classList.add('fa-lock');
    }

    // is this layer's color currently transparent / null
    if (this.layer.color === null) {
      this.colorSelectorProxy.classList.add('transparent');
      this.clearColor.disabled = true;
    } else {
      this.colorSelectorProxy.classList.remove('transparent');
      this.colorSelectorProxy.style.backgroundColor = this.layer.color;
      this.clearColor.disabled = false;
    }

    if (this.layer.tintColor === null) {
      this.colorTintSelectorProxy.classList.add('transparent');
      this.clearColorTint.disabled = true;
    } else {
      this.colorTintSelectorProxy.classList.remove('transparent');
      this.colorTintSelectorProxy.style.backgroundColor = this.layer.tintColor;
      this.clearColorTint.disabled = false;
    }

    if (this.layer.view.isAlphaPicking) {
      this.alphaSelectorProxy.classList.remove('transparent');
      this.alphaSelectorProxy.style.backgroundColor = this.layer.view.alphaColorHex;
    } else {
      this.alphaSelectorProxy.classList.add('transparent');
    }

    // first child?
    this.enableMoveUp();
    this.enableMoveDown();
    if (this.view.parentElement.firstChild.getAttribute('data-layer') === this.layer.id) {
      this.disableMoveUp();
    }
    // last child?
    if (this.view.parentElement.lastChild.getAttribute('data-layer') === this.layer.id) {
      this.disableMoveDown();
    }

    // only child?
    if (this.view.parentElement.childElementCount === 1) {
      this.deleteControl.disabled = true;
    } else {
      this.deleteControl.disabled = false;
    }

    if (this.opacitySliderControl.value !== this.layer.opacity) {
      this.opacitySliderControl.value = this.layer.alpha * 100;
      this.opacityLabel.innerHTML = `${this.layer.alpha * 100}%`;
    }
    if (this.brightnessSliderControl.value !== this.layer.brightness) {
      this.brightnessSliderControl.value = this.layer.brightness;
      this.brightnessLabel.innerHTML = `${this.layer.brightness}%`;
    }
    if (this.contrastSliderControl.value !== this.layer.contrast) {
      this.contrastSliderControl.value = this.layer.contrast;
      this.contrastLabel.innerHTML = `${this.layer.contrast}%`;
    }
    if (this.lineArtBlurSizeControl.value !== this.layer.lineArtBlurSize) {
      this.lineArtBlurSizeControl.value = this.layer.lineArtBlurSize;
      this.lineArtBlurSizeLabel.innerHTML = `${this.layer.lineArtBlurSize}px`;
    }
    let lineArtEnabled = this.layer.filters.some((f) => f.name === "lineArtEffect");
    this.lineArtEnableButton.checked = lineArtEnabled;
    this.lineArtBlurSizeControl.disabled = !lineArtEnabled;

  }

  startColorPicking() {
    this.getColor.classList.add('active');
  }

  endColorPicking() {
    this.getColor.classList.remove('active');
  }

  startAlphaPicking() {
    this.getAlpha.classList.add('active');
  }

  endAlphaPicking() {
    this.getAlpha.classList.remove('active');
    this.colorBoxSpan.classList.toggle("show");
  }

  enableMoveUp() {
    this.moveUpControl.disabled = false;
  }

  disableMoveUp() {
    this.moveUpControl.disabled = true;
  }

  enableMoveDown() {
    this.moveDownControl.disabled = false;
  }

  disableMoveDown() {
    this.moveDownControl.disabled = true;
  }
}

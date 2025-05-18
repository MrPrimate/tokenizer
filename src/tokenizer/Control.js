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

  constructor(tokenizer, layer) {
    this.tokenizer = tokenizer;
    this.layer = layer;
    this.view = document.createElement('div');
    this.view.setAttribute('data-layer', this.layer.id);
    this.view.classList.add('view-layer-control');

    const idSection = document.createElement("div");
    idSection.name = "layer-id-num";
    idSection.title = game.i18n.localize("vtta-tokenizer.label.LayerNumber");
    idSection.classList.add("section");
    this.idNumber = document.createElement("div");
    this.idNumber.innerHTML = this.layer.getLayerLabel();

    let previewSection = document.createElement('div');
    previewSection.name = 'preview';
    previewSection.classList.add('section');

    let previewMaskSection = document.createElement('div');
    previewMaskSection.name = 'previewMask';
    previewMaskSection.classList.add('section');

    this.configureColorManagement();

    this.configureMaskManagementSection();

    this.configureTranslationControls();

    // opacity management
    this.configureOpacitySection();
    this.configureMagicLassoSection();

    // the move up/down order section
    this.configureMovementSection();

    // danger zone
    this.configureDeletionSection();

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
      this.colorManagementSection.appendChild(this.opacityManagementSection);
      this.maskControl.disabled = true;
    } else {
      this.view.appendChild(this.positionManagementSection);
      this.positionManagementSection.appendChild(this.visibleControl);
      this.positionManagementSection.appendChild(this.activeControl);
      // this.positionManagementSection.appendChild(this.flipControl);
      // this.positionManagementSection.appendChild(this.centreLayerControl);
      this.positionManagementSection.appendChild(this.colorSelectionManagementSection);
      this.positionManagementSection.appendChild(this.opacityManagementSection);
      // this.positionManagementSection.appendChild(this.resetControl);
      this.positionManagementSection.appendChild(this.layerMovementControl);
      // this.positionManagementSection.appendChild(this.layerMovementSelectorSpan);
    }
    this.view.appendChild(this.moveManagementSection);
    this.view.appendChild(this.deleteSection);
  }

  configureMaskManagementSection() {
    this.maskManagementSection = document.createElement('div');
    this.maskManagementSection.name = 'mask-management';
    this.maskManagementSection.classList.add('section');
    let maskManagementTitle = document.createElement('span');
    maskManagementTitle.innerHTML = 'Masks';
    this.maskManagementSection.appendChild(maskManagementTitle);

    // Set the basic mask of this layer
    this.maskControl = document.createElement('button');
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
    this.maskEditControl = document.createElement('button');
    this.maskEditControl.classList.add('mask-control', 'popup-button');
    // this.maskEditControl.disabled = true;
    this.maskEditControl.title = game.i18n.localize("vtta-tokenizer.label.EditMask");
    let maskEditButtonText = document.createElement('i');
    maskEditButtonText.classList.add('fas', 'fa-pencil');
    this.maskEditControl.appendChild(maskEditButtonText);

    // send a mask event when clicked
    this.maskEditControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('edit-mask', { detail: { layerId: this.layer.id } }));
    });

    // Set the mask of this layer
    this.maskResetControl = document.createElement('button');
    this.maskResetControl.classList.add('popup-button');
    this.maskResetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetMasks");
    let maskResetButtonText = document.createElement('i');
    maskResetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    this.maskResetControl.appendChild(maskResetButtonText);

    this.maskResetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset-mask-layer', { detail: { layerId: this.layer.id } }));
    });

    this.masksControl = document.createElement('button');
    this.masksControl.classList.add('blend-control');
    this.masksControl.title = game.i18n.localize("vtta-tokenizer.label.AdvancedMaskApplication");

    let masksButtonText = document.createElement('i');
    masksButtonText.classList.add('fas', 'fa-masks-theater');
    this.masksControl.appendChild(masksButtonText);

    this.maskSelectorSpan = document.createElement('div');
    this.maskSelectorSpan.classList.add('popup');

    this.maskLayerSelector = document.createElement("div");
    this.maskLayerSelector.classList.add("popup-selector");

    this.addSelectLayerMasks();
    let basicMaskControls = document.createElement('div');
    basicMaskControls.classList.add('basic-mask-control');
    basicMaskControls.appendChild(this.maskControl);
    basicMaskControls.appendChild(this.maskEditControl);
    basicMaskControls.appendChild(this.maskResetControl);
    
    this.maskSelectorSpan.appendChild(basicMaskControls);
    this.maskSelectorSpan.appendChild(this.maskLayerSelector);

    this.blendControlImage = document.createElement('select');
    this.blendControlImage.classList.add('blend-control-image');
    this.blendControlMask = document.createElement('select');
    this.blendControlMask.classList.add('blend-control-mask');

    [this.blendControlMask, this.blendControlImage].forEach((blendControlElement) => {
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
    blendImageDiv.appendChild(this.blendControlImage);
    this.maskSelectorSpan.appendChild(blendImageDiv);

    let blendMaskDiv = document.createElement('div');
    let blendMaskText = document.createElement('i');
    blendMaskText.title = game.i18n.localize("vtta-tokenizer.label.MaskBlendMode");
    blendMaskText.classList.add('fas', 'fa-mask');
    blendMaskDiv.appendChild(blendMaskText);
    blendMaskDiv.appendChild(this.blendControlMask);
    this.maskSelectorSpan.appendChild(blendMaskDiv);

    // send an activate event when clicked
    this.masksControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(this.masksControl, this.maskSelectorSpan);
    }, true);

    // blend mode controls
    let blendManagementSection = document.createElement('div');
    blendManagementSection.appendChild(this.masksControl);
    blendManagementSection.appendChild(this.maskSelectorSpan);
    this.maskManagementSection.appendChild(blendManagementSection);
  }

  configureTranslationControls() {
    // position management section
    this.positionManagementSection = document.createElement('div');
    this.positionManagementSection.name = 'position-management';
    this.positionManagementSection.classList.add('section');
    let positionManagementTitle = document.createElement('span');
    positionManagementTitle.innerHTML = game.i18n.localize("vtta-tokenizer.label.Transform");
    this.positionManagementSection.appendChild(positionManagementTitle);

    // is this layer visible?
    this.visibleControl = document.createElement('button');
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
    this.activeControl = document.createElement('button');
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
    this.flipControl = document.createElement('button');
    this.flipControl.title = game.i18n.localize("vtta-tokenizer.label.FlipLayer");
    this.flipControl.classList.add('flip-control', 'popup-button');
    let flipButtonText = document.createElement('i');
    flipButtonText.classList.add('fas', 'fa-people-arrows');
    this.flipControl.appendChild(flipButtonText);

    // send an activate event when clicked
    this.flipControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('flip', { detail: { layerId: this.layer.id } }));
    });

    // resets the layer on the view
    this.resetControl = document.createElement('button');
    this.resetControl.classList.add('reset-control', 'popup-button');
    this.resetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetLayer");
    let resetButtonText = document.createElement('i');
    resetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    this.resetControl.appendChild(resetButtonText);

    // send an activate event when clicked
    this.resetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset', { detail: { layerId: this.layer.id } }));
    });

    // Centres the layer
    this.centreLayerControl = document.createElement('button');
    this.centreLayerControl.title = game.i18n.localize("vtta-tokenizer.label.CentreLayer");
    this.centreLayerControl.classList.add('centre-control', 'popup-button');
    let centreLayerText = document.createElement('i');
    centreLayerText.classList.add('fas', 'fa-crosshairs');
    this.centreLayerControl.appendChild(centreLayerText);

    // send an activate event when clicked
    this.centreLayerControl.addEventListener("click", (event) => {
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

    buttonDiv.appendChild(this.flipControl);
    buttonDiv.appendChild(this.centreLayerControl);
    buttonDiv.appendChild(this.resetControl);

    layerMovementSelectorDiv.appendChild(buttonDiv);
    layerMovementSelectorDiv.appendChild(document.createElement('hr'));

    let scaleDiv = document.createElement('div');
    scaleDiv.classList.add("popup-selector");

    this.scaleInput = document.createElement('input');
    this.scaleInput.type = "text";
    this.scaleInput.value = `${this.layer.scale * 100}`;
    this.scaleInput.classList.add('scale-input', 'popup-input');

    this.scaleControl = document.createElement('button');
    this.scaleControl.title = game.i18n.localize("vtta-tokenizer.label.ScaleButton");
    this.scaleControl.classList.add('scale-control', 'popup-button');
    let scaleText = document.createElement('i');
    scaleText.classList.add('fas', 'fa-compress');
    this.scaleControl.appendChild(scaleText);

    this.scaleControl.addEventListener("click", (event) => {
      event.preventDefault();
      const percentage = parseFloat(this.scaleInput.value);
      if (isNaN(percentage)) {
        this.scaleInput.value = `${this.layer.scale * 100}`;
      } else {
        this.view.dispatchEvent(new CustomEvent('scale-layer', { detail: { layerId: this.layer.id, percent: percentage } }));
      }
    });

    scaleDiv.appendChild(this.scaleInput);
    scaleDiv.appendChild(this.scaleControl);

    layerMovementSelectorDiv.appendChild(scaleDiv);

    let wrapperDiv = document.createElement("div");
    wrapperDiv.appendChild(layerMovementControl);
    wrapperDiv.appendChild(layerMovementSelectorDiv);
    
    this.layerMovementControl = wrapperDiv;
  }

  configureDeletionSection() {
    this.deleteSection = document.createElement('div');
    this.deleteSection.name = 'delete-management';
    this.deleteSection.classList.add('section');

    // duplicate
    this.duplicateControl = document.createElement('button');
    this.duplicateControl.classList.add('duplicate-control');
    this.duplicateControl.title = game.i18n.localize("vtta-tokenizer.label.CloneLayer");
    let duplicateButtonText = document.createElement('i');
    duplicateButtonText.classList.add('fas', 'fa-clone');
    this.duplicateControl.appendChild(duplicateButtonText);

    this.duplicateControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('duplicate', {
          detail: { layerId: this.layer.id },
        }),
      );
    });

    // delete
    this.deleteControl = document.createElement('button');
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

    this.deleteSection.appendChild(this.duplicateControl);
    this.deleteSection.appendChild(this.deleteControl);
  }

  configureColorManagement() {
    this.colorManagementSection = document.createElement('div');
    this.colorManagementSection.name = 'color-management';
    this.colorManagementSection.classList.add('section');
    let colorManagementTitle = document.createElement('span');
    colorManagementTitle.innerHTML = game.i18n.localize("vtta-tokenizer.label.Color");
    this.colorManagementSection.appendChild(colorManagementTitle);

    // the color picker element, which is hidden
    this.colorSelector = document.createElement('input');
    this.colorSelector.type = 'color';
    this.colorSelector.value = '#00000FF';

    // a nicer looking proxy for the color picker
    this.colorSelectorProxy = document.createElement('div');
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
    this.clearColor = document.createElement('button');
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
    this.getColor = document.createElement('button');
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

  configureMovementSection() {
    this.moveManagementSection = document.createElement('div');
    this.moveManagementSection.classList.add('move-control');
    this.moveManagementSection.name = 'move-management';
    this.moveManagementSection.classList.add('section');

    // moving up
    this.moveUpControl = document.createElement('button');
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
    this.moveDownControl = document.createElement('button');
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

  configureOpacitySection() {
    this.opacityManagementSection = document.createElement('div');

    this.opacityControl = document.createElement('button');
    this.opacityControl.classList.add('opacity-control');
    this.opacityControl.title = game.i18n.localize("vtta-tokenizer.label.Opacity");

    let opacityButtonText = document.createElement('i');
    opacityButtonText.classList.add('fas', 'fa-adjust');
    this.opacityControl.appendChild(opacityButtonText);
    this.opacityManagementSection.appendChild(this.opacityControl);

    // this.opacitySliderSpan = document.createElement('span');
    this.opacitySliderSpan = document.createElement('div');
    this.opacitySliderSpan.classList.add('popup');
    // this.opacitySliderSpan.classList.add("property-attribution");

    this.opacitySliderControl = document.createElement('input');
    this.opacitySliderControl.type = 'range';
    this.opacitySliderControl.min = 0;
    this.opacitySliderControl.max = 100;
    this.opacitySliderControl.value = 100;
    this.opacitySliderControl.title = game.i18n.localize("vtta-tokenizer.label.Opacity");
    this.opacitySliderControl.name = "opacity";

    this.opacitySliderSpan.appendChild(this.opacitySliderControl);

    // send an activate event when clicked
    this.opacityControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(this.opacityControl, this.opacitySliderSpan);
    }, true);

    this.opacitySliderSpan.addEventListener('mouseleave', () => {
      this.opacitySliderSpan.classList.remove("show");
    });

    this.opacitySliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        opacity: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('opacity', { detail }));
    });

    this.opacityManagementSection.appendChild(this.opacitySliderSpan);
  }

  configureMagicLassoSection() {
    this.colorSelectionManagementSection = document.createElement('div');

    this.colorSelectionControl = document.createElement('button');
    this.colorSelectionControl.classList.add('color-selection-control');
    this.colorSelectionControl.title = game.i18n.localize("vtta-tokenizer.label.ColorChangeControl");

    let buttonText = document.createElement('i');
    buttonText.classList.add('fa-thin', 'fa-eye-dropper', 'fa-regular');
    this.colorSelectionControl.appendChild(buttonText);
    this.colorSelectionManagementSection.appendChild(this.colorSelectionControl);

    this.colorThresholdSliderSpan = document.createElement('div');
    this.colorThresholdSliderSpan.classList.add('popup');

    this.colorThresholdSliderControl = document.createElement('input');
    this.colorThresholdSliderControl.type = 'range';
    this.colorThresholdSliderControl.min = 0;
    this.colorThresholdSliderControl.max = 150;
    this.colorThresholdSliderControl.value = 15;
    this.colorThresholdSliderControl.title = game.i18n.localize("vtta-tokenizer.label.ColorThreshold");
    this.colorThresholdSliderControl.name = "color-threshold";

    // send an activate event when clicked
    this.colorSelectionControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleVisibleDiv(this.colorSelectionControl, this.colorThresholdSliderSpan);
    }, true);

    this.colorThresholdSliderControl.addEventListener('input', (event) => {
      event.preventDefault();
      const detail = {
        layerId: this.layer.id,
        tolerance: event.target.value,
      };
      this.view.dispatchEvent(new CustomEvent('transparency-level', { detail }));
    });

    // get color from canvas
    this.getAlpha = document.createElement('button');
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

    this.alphaSelectorProxy = document.createElement('div');
    this.alphaSelectorProxy.classList.add('color-picker', 'transparent');

    this.transparencyResetControl = document.createElement('button');
    this.transparencyResetControl.classList.add('popup-button');
    this.transparencyResetControl.title = game.i18n.localize("vtta-tokenizer.label.ResetColorTransparency");
    let resetButtonText = document.createElement('i');
    resetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    this.transparencyResetControl.appendChild(resetButtonText);

    this.transparencyResetControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset-transparency-level', { detail: { layerId: this.layer.id } }));
    });

    // get color from canvas
    this.magicLassoControl = document.createElement('button');
    this.magicLassoControl.classList.add('popup-button');
    this.magicLassoControl.title = game.i18n.localize("vtta-tokenizer.label.MagicLasso");
    let magicLassoButtonText = document.createElement('i');
    magicLassoButtonText.classList.add('fa-thin', 'fa-lasso-sparkles', 'fa-regular');
    this.magicLassoControl.appendChild(magicLassoButtonText);

    this.magicLassoControl.addEventListener("click", (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('magic-lasso', { detail: { layerId: this.layer.id } }));
    });


    let lassoControls = document.createElement('div');
    lassoControls.classList.add('basic-mask-control');
    lassoControls.appendChild(this.magicLassoControl);

    this.#tintControls();
    let tintControls = document.createElement('div');
    tintControls.classList.add('basic-mask-control');
    tintControls.appendChild(this.colorTintSelector);
    tintControls.appendChild(this.colorTintSelectorProxy);
    tintControls.appendChild(this.clearColorTint);

    let transparencyControls = document.createElement('div');
    transparencyControls.classList.add('basic-mask-control');
    transparencyControls.appendChild(this.alphaSelectorProxy);
    transparencyControls.appendChild(this.getAlpha);
    transparencyControls.appendChild(this.transparencyResetControl);

    this.colorThresholdSliderSpan.appendChild(lassoControls);
    this.colorThresholdSliderSpan.appendChild(document.createElement('hr'));
    this.colorThresholdSliderSpan.appendChild(tintControls);
    this.colorThresholdSliderSpan.appendChild(document.createElement('hr'));
    this.colorThresholdSliderSpan.appendChild(transparencyControls);
    this.colorThresholdSliderSpan.appendChild(this.colorThresholdSliderControl);
    this.colorSelectionManagementSection.appendChild(this.colorThresholdSliderSpan);
  }

  #tintControls() {
    // the color picker element, which is hidden
    this.colorTintSelector = document.createElement('input');
    this.colorTintSelector.type = 'color';
    this.colorTintSelector.value = '#00000FF';

    // a nicer looking proxy for the color picker
    this.colorTintSelectorProxy = document.createElement('div');
    this.colorTintSelectorProxy.title = game.i18n.localize("vtta-tokenizer.label.EditLayerTint");
    this.colorTintSelectorProxy.classList.add('color-picker', 'transparent');
    this.colorTintSelectorProxy.addEventListener("click", () => {
      this.colorTintSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    this.colorTintSelector.addEventListener('change', (event) => {
      this.colorTintSelectorProxy.style.backgroundColor = event.target.value;
      this.colorTintSelectorProxy.classList.remove('transparent');
      this.view.dispatchEvent(
        new CustomEvent('color-tint', {
          detail: { layerId: this.layer.id, color: event.target.value },
        }),
      );
    });

    // ability to clear the color of the layer
    this.clearColorTint = document.createElement('button');
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
  }

  addSelectLayerMasks() {
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
    this.addSelectLayerMasks();

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
    this.colorThresholdSliderSpan.classList.toggle("show");
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

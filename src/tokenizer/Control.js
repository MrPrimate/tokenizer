import CONSTANTS from "../constants.js";

export default class Control {
  constructor(layer) {
    // , layerId) {
    this.layer = layer;
    // this.layerId = layerId;
    this.view = document.createElement('div');
    this.view.setAttribute('data-layer', this.layer.id);
    this.view.classList.add('view-layer-control');

    let previewSection = document.createElement('div');
    previewSection.name = 'preview';
    previewSection.classList.add('section');

    let colorManagementSection = document.createElement('div');
    colorManagementSection.name = 'color-management';
    colorManagementSection.classList.add('section');
    let colorManagementTitle = document.createElement('span');
    colorManagementTitle.innerHTML = 'Color';
    colorManagementSection.appendChild(colorManagementTitle);

    // the color picker element, which is hidden
    this.colorSelector = document.createElement('input');
    this.colorSelector.type = 'color';
    this.colorSelector.value = '#000000FF';

    // a nicer looking proxy for the color picker
    this.colorSelectorProxy = document.createElement('div');
    this.colorSelectorProxy.title = "Edit tint";
    this.colorSelectorProxy.classList.add('color-picker', 'transparent');
    this.colorSelectorProxy.addEventListener('click', () => {
      this.colorSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    this.colorSelector.addEventListener('change', (event) => {
      this.colorSelectorProxy.style.backgroundColor = event.target.value;
      this.colorSelectorProxy.classList.remove('transparent');
      this.view.dispatchEvent(
        new CustomEvent('color', {
          detail: { layerId: this.layer.id, color: event.target.value },
        })
      );
    });

    // ability to clear the color of the layer
    this.clearColor = document.createElement('button');
    this.clearColor.disabled = true;
    this.clearColor.classList.add('danger');
    this.clearColor.title = "Clear tint";
    let clearButtonText = document.createElement('i');
    clearButtonText.classList.add('fas', 'fa-minus-circle');
    this.clearColor.appendChild(clearButtonText);

    this.clearColor.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('color', {
          detail: { layerId: this.layer.id, color: null },
        })
      );
    });

    // get color from canvas
    this.getColor = document.createElement('button');
    this.getColor.title = "Pick tint color from canvas";
    let colorButtonText = document.createElement('i');
    colorButtonText.classList.add('fas', 'fa-eye-dropper');
    this.getColor.appendChild(colorButtonText);

    // dispatch the request for color picking
    this.getColor.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.getColor.classList.contains('active')) {
        this.getColor.classList.remove('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-color-end', {
            detail: { layerId: this.layer.id },
          })
        );
      } else {
        this.getColor.classList.add('active');
        this.view.dispatchEvent(
          new CustomEvent('pick-color-start', {
            detail: { layerId: this.layer.id },
          })
        );
      }
    });

    let maskManagementSection = document.createElement('div');
    maskManagementSection.name = 'mask-management';
    maskManagementSection.classList.add('section');
    let maskManagementTitle = document.createElement('span');
    maskManagementTitle.innerHTML = 'Mask';
    maskManagementSection.appendChild(maskManagementTitle);

    // Set the mask of this layer
    this.maskControl = document.createElement('button');
    this.maskControl.classList.add('mask-control');
    this.maskControl.title = "Toggle masking";
    let maskButtonText = document.createElement('i');
    maskButtonText.classList.add('fas', 'fa-mask');
    this.maskControl.appendChild(maskButtonText);

    // send a mask event when clicked
    this.maskControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('mask', { detail: { layerId: this.layer.id } }));
    });

    this.visibleControl = document.createElement('button');
    this.visibleControl.classList.add('visible-layer');
    this.visibleControl.title = "Visible layer?";

    let visibleButtonText = document.createElement('i');
    visibleButtonText.classList.add('fas', 'fa-eye');
    this.visibleControl.appendChild(visibleButtonText);

    // send a mask event when clicked
    this.visibleControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('visible', { detail: { layerId: this.layer.id } }));
    });

    // blend mode controls
    this.blendControl = document.createElement('select');
    // this.blendControl.disabled = true;
    this.blendControl.classList.add('blend-control');

    for (const mode of Object.values(CONSTANTS.BLEND_MODES)) {
      const option = document.createElement('option');
      option.value = mode;
      option.innerHTML = mode;
      this.blendControl.append(option);
    }

    this.blendControl.addEventListener('change', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('blend', {
        detail: {
          layerId: this.layer.id,
          blendMode: event.target.value,
        }
      }));
    });

    let positionManagementSection = document.createElement('div');
    positionManagementSection.name = 'position-management';
    positionManagementSection.classList.add('section');
    let positionManagementTitle = document.createElement('span');
    positionManagementTitle.innerHTML = 'Transform';
    positionManagementSection.appendChild(positionManagementTitle);

    // Makes the layer active for translating/ scaling
    this.activeControl = document.createElement('button');
    this.activeControl.title = "Enable/disable transformations";
    this.activeControl.classList.add('mask-control');
    let activeButtonText = document.createElement('i');
    activeButtonText.classList.add('fas', 'fa-lock');
    this.activeControl.appendChild(activeButtonText);

    // send an activate event when clicked
    this.activeControl.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.activeControl.classList.contains('active')) {
        this.view.dispatchEvent(new CustomEvent('deactivate', { detail: { layerId: this.layer.id } }));
      } else {
        this.view.dispatchEvent(new CustomEvent('activate', { detail: { layerId: this.layer.id } }));
      }
    });

    // Makes flips the layer
    this.flipControl = document.createElement('button');
    this.flipControl.title = "Flip/Mirror layer";
    this.flipControl.classList.add('flip-control');
    let flipButtonText = document.createElement('i');
    flipButtonText.classList.add('fas', 'fa-people-arrows');
    this.flipControl.appendChild(flipButtonText);

    // send an activate event when clicked
    this.flipControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('flip', { detail: { layerId: this.layer.id } }));
    });

    // resets the layer on the view
    this.resetControl = document.createElement('button');
    this.resetControl.classList.add('reset-control');
    this.resetControl.title = "Reset layer";
    let resetButtonText = document.createElement('i');
    resetButtonText.classList.add('fas', 'fa-compress-arrows-alt');
    this.resetControl.appendChild(resetButtonText);

    // send an activate event when clicked
    this.resetControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('reset', { detail: { layerId: this.layer.id } }));
    });

    // resets the layer on the view
    let opacityManagementSection = document.createElement('div');

    this.opacityControl = document.createElement('button');
    this.opacityControl.classList.add('opacity-control');
    this.opacityControl.title = "Opacity";

    let opacityButtonText = document.createElement('i');
    opacityButtonText.classList.add('fas', 'fa-adjust');
    this.opacityControl.appendChild(opacityButtonText);

    // this.opacitySliderSpan = document.createElement('span');
    this.opacitySliderSpan = document.createElement('div');
    this.opacitySliderSpan.classList.add('popup');
    // this.opacitySliderSpan.classList.add("property-attribution");

    this.opacitySliderControl = document.createElement('input');
    this.opacitySliderControl.type = 'range';
    this.opacitySliderControl.min = 0;
    this.opacitySliderControl.max = 100;
    this.opacitySliderControl.value = 100;
    this.opacitySliderControl.title = "Opacity";
    this.opacitySliderControl.name = "opacity";

    this.opacitySliderSpan.appendChild(this.opacitySliderControl);

    // send an activate event when clicked
    this.opacityControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.opacitySliderSpan.classList.toggle("show");
    });

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

    opacityManagementSection.appendChild(this.opacityControl);
    opacityManagementSection.appendChild(this.opacitySliderSpan);

    // the move up/down order section
    let moveManagementSection = document.createElement('div');
    moveManagementSection.classList.add('move-control');
    moveManagementSection.name = 'move-management';
    moveManagementSection.classList.add('section');

    // moving up
    this.moveUpControl = document.createElement('button');
    this.moveUpControl.classList.add('move-control', 'move-up');
    this.moveUpControl.title = "Move layer up";
    let moveUpButtonText = document.createElement('i');
    moveUpButtonText.classList.add('fas', 'fa-caret-up');
    this.moveUpControl.appendChild(moveUpButtonText);

    // moving up event dispatcher
    this.moveUpControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('move', {
          detail: { layerId: this.layer.id, direction: 'up' },
        })
      );
    });

    // moving down
    this.moveDownControl = document.createElement('button');
    this.moveDownControl.classList.add('move-control', 'move-down');
    this.moveDownControl.title = "Move layer down";
    let moveDownButtonText = document.createElement('i');
    moveDownButtonText.classList.add('fas', 'fa-caret-down');
    this.moveDownControl.appendChild(moveDownButtonText);

    // moving down event dispatcher
    this.moveDownControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('move', {
          detail: { layerId: this.layer.id, direction: 'down' },
        })
      );
    });

    // danger zone
    let deleteSection = document.createElement('div');
    deleteSection.name = 'delete-management';
    deleteSection.classList.add('section');

    // delete
    this.deleteControl = document.createElement('button');
    this.deleteControl.classList.add('delete-control');
    this.deleteControl.title = "Delete layer (cannot be undone)";
    let deleteButtonText = document.createElement('i');
    deleteButtonText.classList.add('fas', 'fa-trash-alt');
    this.deleteControl.appendChild(deleteButtonText);

    this.deleteControl.addEventListener('click', (event) => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('delete', {
          detail: { layerId: this.layer.id },
        })
      );
    });

    // push all elements to the control's view
    this.view.appendChild(previewSection);
    previewSection.appendChild(this.layer.canvas);
    this.view.appendChild(maskManagementSection);
    maskManagementSection.appendChild(this.maskControl);
    maskManagementSection.appendChild(this.visibleControl);
    maskManagementSection.appendChild(this.blendControl);
    if (this.layer.colorLayer) {
      this.view.appendChild(colorManagementSection);
      colorManagementSection.appendChild(this.colorSelector);
      colorManagementSection.appendChild(this.colorSelectorProxy);
      colorManagementSection.appendChild(this.clearColor);
      colorManagementSection.appendChild(this.getColor);
      colorManagementSection.appendChild(opacityManagementSection);
      this.maskControl.disabled = true;
    } else {
      this.view.appendChild(positionManagementSection);
      positionManagementSection.appendChild(this.activeControl);
      positionManagementSection.appendChild(this.flipControl);
      positionManagementSection.appendChild(this.resetControl);
      positionManagementSection.appendChild(opacityManagementSection);
    }
    this.view.appendChild(moveManagementSection);
    moveManagementSection.appendChild(this.moveUpControl);
    moveManagementSection.appendChild(this.moveDownControl);

    this.view.appendChild(deleteSection);
    deleteSection.appendChild(this.deleteControl);
  }

  refresh() {
    // is this layer providing the mask for the view?
    if (this.layer.providesMask) {
      this.maskControl.classList.add('active');
      // this.blendControl.disabled = false;
    } else {
      this.maskControl.classList.remove('active');
      // this.blendControl.disabled = true;
    }

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

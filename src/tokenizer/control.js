export default class Control {
  constructor(layer) {
    //, layerId) {
    this.layer = layer;
    //this.layerId = layerId;
    this.view = document.createElement('div');
    this.view.setAttribute('data-layer', this.layer.id);
    this.view.classList.add('view-layer-control');

    let previewSection = document.createElement('div');
    previewSection.name = 'preview';
    previewSection.classList.add('section');

    let colorManagementSection = document.createElement('div');
    colorManagementSection.name = 'color-management';
    colorManagementSection.classList.add('section');
    var title = document.createElement('span');
    title.innerHTML = 'Color';
    colorManagementSection.appendChild(title);

    // the color picker element, which is hidden
    this.colorSelector = document.createElement('input');
    this.colorSelector.type = 'color';
    this.colorSelector.value = '#000000FF';

    // a nicer looking proxy for the color picker
    this.colorSelectorProxy = document.createElement('div');
    this.colorSelectorProxy.title = "Edit tint"
    this.colorSelectorProxy.classList.add('color-picker', 'transparent');
    this.colorSelectorProxy.addEventListener('click', event => {
      this.colorSelector.click();
    });

    // listen to the color Selector onChange Event to update the layer's background color
    this.colorSelector.addEventListener('change', event => {
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
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-minus-circle');
    this.clearColor.appendChild(buttonText);

    this.clearColor.addEventListener('click', event => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('color', {
          detail: { layerId: this.layer.id, color: null },
        })
      );
    });

    // get color from canvas
    this.getColor = document.createElement('button');
    this.getColor.title = "Pick tint color from canvas"
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-eye-dropper');
    this.getColor.appendChild(buttonText);

    // dispatch the request for color picking
    this.getColor.addEventListener('click', event => {
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
    maskManagementSection.name = 'color-management';
    maskManagementSection.classList.add('section');
    var title = document.createElement('span');
    title.innerHTML = 'Mask';
    maskManagementSection.appendChild(title);

    // Set the mask of this layer
    this.maskControl = document.createElement('button');
    this.maskControl.classList.add('mask-control');
    this.maskControl.title = "Toggle masking";
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-mask');
    this.maskControl.appendChild(buttonText);

    // send a mask event when clicked
    this.maskControl.addEventListener('click', event => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('mask', { detail: { layerId: this.layer.id } }));
    });

    let positionManagementSection = document.createElement('div');
    positionManagementSection.name = 'position-management';
    positionManagementSection.classList.add('section');
    var title = document.createElement('span');
    title.innerHTML = 'Transform';
    positionManagementSection.appendChild(title);

    // Makes the layer active for translating/ scaling
    this.activeControl = document.createElement('button');
    this.activeControl.title = "Enable/disable transformations";
    this.activeControl.classList.add('mask-control');
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-lock');
    this.activeControl.appendChild(buttonText);

    // send an activate event when clicked
    this.activeControl.addEventListener('click', event => {
      event.preventDefault();
      if (this.activeControl.classList.contains('active')) {
        this.view.dispatchEvent(new CustomEvent('deactivate', { detail: { layerId: this.layer.id } }));
      } else {
        this.view.dispatchEvent(new CustomEvent('activate', { detail: { layerId: this.layer.id } }));
      }
    });

    // centers the layer on the view
    this.centerControl = document.createElement('button');
    this.centerControl.classList.add('center-control');
    this.centerControl.title = "Center layer";
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-compress-arrows-alt');
    this.centerControl.appendChild(buttonText);

    // send an activate event when clicked
    this.centerControl.addEventListener('click', event => {
      event.preventDefault();
      this.view.dispatchEvent(new CustomEvent('center', { detail: { layerId: this.layer.id } }));
    });

    // the move up/down order section
    let moveManagementSection = document.createElement('div');
    moveManagementSection.classList.add('move-control');
    moveManagementSection.name = 'color-management';
    moveManagementSection.classList.add('section');

    // moving up
    this.moveUpControl = document.createElement('button');
    this.moveUpControl.classList.add('move-control', 'move-up');
    this.moveUpControl.title = "Move layer up";
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-caret-up');
    this.moveUpControl.appendChild(buttonText);

    // moving up event dispatcher
    this.moveUpControl.addEventListener('click', event => {
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
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-caret-down');
    this.moveDownControl.appendChild(buttonText);

    // moving down event dispatcher
    this.moveDownControl.addEventListener('click', event => {
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
    var buttonText = document.createElement('i');
    buttonText.classList.add('fas', 'fa-trash-alt');
    this.deleteControl.appendChild(buttonText);

    this.deleteControl.addEventListener('click', event => {
      event.preventDefault();
      this.view.dispatchEvent(
        new CustomEvent('delete', {
          detail: { layerId: this.layer.id },
        })
      );
    });

    // push all elements to the control's view
    this.view.appendChild(previewSection);
    previewSection.appendChild(this.layer.view);
    this.view.appendChild(colorManagementSection);
    colorManagementSection.appendChild(this.colorSelector);
    colorManagementSection.appendChild(this.colorSelectorProxy);
    colorManagementSection.appendChild(this.clearColor);
    colorManagementSection.appendChild(this.getColor);
    this.view.appendChild(maskManagementSection);
    maskManagementSection.appendChild(this.maskControl);
    this.view.appendChild(positionManagementSection);
    positionManagementSection.appendChild(this.activeControl);
    positionManagementSection.appendChild(this.centerControl);
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
    } else {
      this.maskControl.classList.remove('active');
    }

    // is this layer active?
    if (this.layer.isActive) {
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

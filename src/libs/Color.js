import CONSTANTS from "../constants.js";

export default class Color {

  constructor({ red = 0, green = 0, blue = 0, alpha = 1, tolerance = 50 } = {}) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
    this.tolerance = tolerance;
  }

  isNeighborColor(color) {
    return Math.abs(this.red - color.red) <= this.tolerance
      && Math.abs(this.green - color.green) <= this.tolerance
      && Math.abs(this.blue - color.blue) <= this.tolerance;
  }

  isOpaque() {
    return this.alpha > CONSTANTS.COLOR.OPAQUE_THRESHOLD;
  }

}

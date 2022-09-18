const CONSTANTS = {
  MODULE_ID: "vtta-tokenizer",
  MODULE_NAME: "Tokenizer",
  BLEND_MODES: {
    DEFAULT: "source-over",
    SOURCE_OVER: "source-over",
    SOURCE_IN: "source-in",
    SOURCE_OUT: "source-out",
    SOURCE_ATOP: "source-atop",
    DESTINATION_OVER: "destination-over",
    DESTINATION_IN: "destination-in",
    DESTINATION_OUT: "destination-out",
    DESTINATION_ATOP: "destination-atop",
    LIGHTER: "lighter",
    COPY: "copy",
    XOR: "xor",
    MULTIPLY: "multiply",
    SCREEN: "screen",
    OVERLAY: "overlay",
    DARKEN: "darken",
    LIGHTEN: "lighten",
    COLOR_DODGE: "color-dodge",
    COLOR_BURN: "color-burn",
    HARD_LIGHT: "hard-light",
    SOFT_LIGHT: "soft-light",
    DIFFERENCE: "difference",
    EXCLUSION: "exclusion",
    HUE: "hue",
    SATURATION: "saturation",
    COLOR: "color",
    LUMINOSITY: "luminosity",
  },
  // null scale results in auto scaling calculation - recommended
  TOKEN_OFFSET: { position: { x: null, y: null }, scale: null },
  TO_RADIANS: Math.PI / 180,
  TRANSPARENCY_THRESHOLD: 254,
  MASK_DENSITY: 400,
  COLOR: {
    OPAQUE_THRESHOLD: 254,
    TRANSPARENCY_THRESHOLD: 0,
  },
  MASK: {
    SAMPLE_SIZE: 5,
    MINIMUM_ALPHA: 255,
  },
  BAD_DIRS: ["[data]", "[data] ", "", null],
};

CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;

export default CONSTANTS;

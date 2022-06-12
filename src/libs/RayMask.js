import CONSTANTS from "../constants.js";

function isOpaque(alpha) {
  return alpha > CONSTANTS.COLOR.OPAQUE_THRESHOLD;
}

function getEnrichedPixel(imageData, point) {
  const index = point.x + (point.y * imageData.height);
  const baseIndex = index * 4;
  const color = {
    red: imageData.data[baseIndex],
    green: imageData.data[baseIndex + 1],
    blue: imageData.data[baseIndex + 2],
    alpha: imageData.data[baseIndex + 3],
  };
  return {
    x: point.x,
    y: point.y,
    color,
  };
}

// attempts a Bresenhams line algorithm
function getPixelLine(startPoint, endPoint) {
  const pixels = [];
  const dx = Math.abs(Math.floor(endPoint.x) - Math.floor(startPoint.x));
  const dy = Math.abs(Math.floor(endPoint.y) - Math.floor(startPoint.y));
  const sx = startPoint.x < endPoint.x ? 1 : -1;
  const sy = startPoint.y < endPoint.y ? 1 : -1;
  let err = dx - dy;
  let x = Math.floor(startPoint.x);
  let y = Math.floor(startPoint.y);
  let process = true;

  while (process) {
    pixels.push({ x, y });

    if (x === Math.floor(endPoint.x) && y === Math.floor(endPoint.y)) {
      process = false;
      break;
    } else {
      const e2 = 2 * err;
      if (e2 >= -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  return pixels;
}


function findEdgeOnRay(imageData, startPoint, endPoint) {
  // get all pixels on ray
  const rayPixels = getPixelLine(startPoint, endPoint);
  // find colors and alpha of ray pixels
  const enrichedPixels = rayPixels.map((point) => getEnrichedPixel(imageData, point));

  let start = null;
  let end = null;
  let edgePixel = null;

  // check to see if we find an edge
  enrichedPixels.forEach((pixel, index) => {
    if (isOpaque(pixel.color.alpha)) {
      if (start === null) {
        start = index;
      } else {
        end = index;
      }
      edgePixel = !edgePixel || edgePixel.color.alpha < pixel.color.alpha
        ? pixel
        : edgePixel;
    } else if (end !== null) {
      // reset
      start = null;
      end = null;
    }
  });

  return edgePixel;
}


function createRay(imageData, startPoint, endPoint, findEdge = false) {
  return {
    startPoint,
    endPoint,
    edgePixel: findEdge ? findEdgeOnRay(imageData, startPoint, endPoint) : null,
    processed: findEdge,
  };
}

// get the co-ords of an edge on the canvas(mask)
// 0,0 is top left
function getCanvasEdge(mask, startNum) {
  let pos = startNum;
  if (pos < mask.width - 1) return { x: pos, y: 0 };
  pos -= mask.width - 1;
  if (pos < mask.height - 1) return { x: mask.width - 1, y: pos };
  pos -= mask.height - 1;
  if (pos < mask.width) return { x: mask.width - 1 - pos, y: mask.height - 1 };
  pos -= mask.width - 1;
  return { x: 0, y: mask.height - 1 - pos };
}

function createRays(mask, maskImageData) {
  const maskCentre = {
    x: mask.width / 2,
    y: mask.height / 2,
  };
  
  const edgePoints = (2 * mask.width) + (2 * (mask.height - 2));

  const rays = [];

  // first loop through all rays and process at sample size
  for (let rayIndex = 0; edgePoints > rayIndex; rayIndex++) {
    const sampleRay = rayIndex % CONSTANTS.MASK.SAMPLE_SIZE === 0;
    const ray = createRay(
      maskImageData, 
      maskCentre,
      getCanvasEdge(mask, rayIndex),
      sampleRay,
    );

    rays.push(ray);

    // if we didn't find and edge pixel, lets step back over sample size
    if (sampleRay && !ray.edgePixel) {
      for (let stepIndex = rayIndex - 1; stepIndex < CONSTANTS.MASK.SAMPLE_SIZE && (rayIndex - stepIndex) >= 0; stepIndex++) {
        rays[stepIndex] = createRay(
          maskImageData, 
          maskCentre,
          getCanvasEdge(mask, stepIndex),
          sampleRay,
        );
        if (rays[stepIndex].edgePixel) {
          break;
        }
      }
    }
  }
  return rays;
}

export function generateRayMask(maskCanvas) {
  const maskImageData = maskCanvas
    .getContext("2d")
    .getImageData(0, 0, maskCanvas.width, maskCanvas.height);

  const mask = document.createElement("canvas");
  mask.width = maskCanvas.width;
  mask.height = maskCanvas.height;

  const rays = createRays(mask, maskImageData);

  const context = mask.getContext("2d");

  const edgePoints = rays
    .filter((ray) => ray.edgePixel)
    .map((ray) => ray.edgePixel);

  const defaultFillColor = game.settings.get(CONSTANTS.MODULE_ID, "default-color");
  if (defaultFillColor !== "") context.fillStyle = defaultFillColor;

  // unable to calculate suitable radius, so just fill the whole mask
  if (edgePoints.length < 2) {
    context.rect(0, 0, mask.width, mask.height);
    context.fill();
  } else {
    context.beginPath();
    if (defaultFillColor !== "") context.fillStyle = defaultFillColor;

    edgePoints.forEach((edgePoint, index) => {
      if (index === 0) {
        context.moveTo(edgePoint.x, edgePoint.y);
      } else {
        context.lineTo(edgePoint.x, edgePoint.y);
      }
    });
    context.closePath();
    context.fill();

  }

  return mask;
}

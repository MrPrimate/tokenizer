/**
 * Copyright (c) 2012-2014, Michael Bostock All rights reserved.
 *  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *  The name Michael Bostock may not be used to endorse or promote products derived from this software without specific prior written permission.
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Computes a contour for a given input grid function using the <a
 * href="http://en.wikipedia.org/wiki/Marching_squares">marching
 * squares</a> algorithm. Returns the contour polygon as an array of points.
 *
 * @param grid a two-input function(x, y) that returns true for values
 * inside the contour and false for values outside the contour.
 * @param start an optional starting point [x, y] on the grid.
 * @returns polygon [[x1, y1], [x2, y2], …]
 */

export const geom = {};

// lookup tables for marching directions
const d3GeomContourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, NaN];
const d3GeomContourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, NaN];

export function dGeomContourStart(grid) {
  let x = 0,
    y = 0;

  // search for a starting point; begin at origin
  // and proceed along outward-expanding diagonals
  while (!grid(x, y)) {
    if (x === 0) {
      x = y + 1;
      y = 0;
    } else {
      x -= 1;
      y += 1;
    }
  }

  return [x, y];
}

geom.contour = function(grid, start) {
  let s = start || dGeomContourStart(grid), // starting point
    c = [], // contour polygon
    x = s[0], // current x position
    y = s[1], // current y position
    dx = 0, // next x direction
    dy = 0, // next y direction
    pdx = NaN, // previous x direction
    pdy = NaN, // previous y direction
    i = 0;

  do {
    // determine marching squares index
    i = 0;
    if (grid(x - 1, y - 1)) i += 1;
    if (grid(x, y - 1)) i += 2;
    if (grid(x - 1, y)) i += 4;
    if (grid(x, y)) i += 8;

    // determine next direction
    if (i === 6) {
      dx = pdy === -1 ? -1 : 1;
      dy = 0;
    } else if (i === 9) {
      dx = 0;
      dy = pdx === 1 ? -1 : 1;
    } else {
      dx = d3GeomContourDx[i];
      dy = d3GeomContourDy[i];
    }

    // update contour polygon
    if (dx != pdx && dy != pdy) {
      c.push([x, y]);
      pdx = dx;
      pdy = dy;
    }

    x += dx;
    y += dy;
  } while (s[0] != x || s[1] != y);

  return c;
};

/**
 * End of Block for
 * Copyright (c) 2012-2014, Michael Bostock All rights reserved.
 */

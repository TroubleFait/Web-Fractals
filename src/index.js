// TODO: put complex math in separate file.
// TODO: put fractal math in separate file.
// TODO: '+', '-', 'r' for no-keyboard setups. Touch buttons or volume buttons?

function complex(re, im) {
  return { re, im };
}

function complexAdd(a, b) {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

function complexSub(a, b) {
  return {
    re: a.re - b.re,
    im: a.im - b.im,
  };
}

function complexMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function complexDiv(a, b) {
  const denom = b.re ** 2 + b.im ** 2;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

function complexScalMul(z, x) {
  return {
    re: z.re * x,
    im: z.im * x,
  };
}

function complexScalDiv(z, x) {
  return {
    re: z.re / x,
    im: z.im / x,
  };
}

function complexAbs(z) {
  return Math.sqrt(z.re * z.re + z.im * z.im);
}

function f(z, c) {
  return complexAdd(complexMul(z, z), c);
}

function iterations(c) {
  let z = complex(0, 0);
  for (let n = 0; n < max_iter; n++) {
    if (complexAbs(z) > 2) return n;
    z = f(z, c);
  }
  return max_iter;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  // // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // ctx.setTransform(1, 0, 0, 1, 0, 0);

  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  draw();
}

const ITER_UNIT = 100;
let max_iter = ITER_UNIT;

let min = complex(-2, -1.2),
  max = complex(1, 1.2);

let WIDTH, HEIGHT;
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

canvas.style.touchAction = "none"; // VERY important

function pixel_to_complex(px, py) {
  // const c_real = min.re + px * ((max.re - min.re) / WIDTH),
  //   c_imag = min.im + py * ((max.im - min.im) / HEIGHT);
  // return complex(c_real, c_imag);
  const vector = complexSub(max, min);
  vector.re *= px / WIDTH;
  vector.im *= py / HEIGHT;
  return complexAdd(min, vector);
}

function complex_to_pixel(c) {
  // const px = (c.re - min.re) * (WIDTH / max.re),
  //   py = (c.im - min.im) * (HEIGHT / max.im);
  // return px, py;
  const vector = complexSub(c, min);
  return {
    px: vector.re * (WIDTH / max.re),
    py: vector.im * (HEIGHT / max.im),
  };
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
  } else if (120 <= h && h < 180) {
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function choose_color(iterations) {
  if (iterations == max_iter) return "hsl(0, 0%, 0%)";

  const hue = (iterations / max_iter) * 360;
  const saturation = 100;
  const lightness = 50 + (iterations / max_iter) * 25;

  return hslToRgb(hue, saturation, lightness);
}

function draw(xmin = 0, xmax = WIDTH, ymin = 0, ymax = HEIGHT, isFull = false) {
  const width = xmax - xmin,
    height = ymax - ymin;
  const imgData = ctx.createImageData(width, height);

  for (let px = xmin; px < xmax; px++) {
    const localX = px - xmin;

    for (let py = ymin; py < ymax; py++) {
      const localY = py - ymin;
      const color = choose_color(iterations(pixel_to_complex(px, py)));
      const idx = (localY * width + localX) * 4;
      imgData.data[idx + 0] = color[0]; // R
      imgData.data[idx + 1] = color[1]; // G
      imgData.data[idx + 2] = color[2]; // B
      imgData.data[idx + 3] = 255; // A
    }
  }
  ctx.putImageData(imgData, xmin, ymin);
}

draw();

function zoom(px, py, scale) {
  const c = pixel_to_complex(px, py);
  min.re = c.re + (min.re - c.re) / scale;
  max.re = c.re + (max.re - c.re) / scale;
  min.im = c.im + (min.im - c.im) / scale;
  max.im = c.im + (max.im - c.im) / scale;
  draw();
}

let isRendering = false;
let pendingTranslate = { x: 0, y: 0 };

function translate(dx, dy) {
  const d_real = (dx * (max.re - min.re)) / WIDTH,
    d_imag = (dy * (max.im - min.im)) / HEIGHT;
  min.re -= d_real;
  max.re -= d_real;
  min.im -= d_imag;
  max.im -= d_imag;

  pendingTranslate.x = dx;
  pendingTranslate.y = dy;

  if (isRendering && max_iter > 500) {
    ctx.drawImage(canvas, -dx, -dy);
    return;
  }

  isRendering = true;
  requestAnimationFrame(() => {
    const dx = pendingTranslate.x,
      dy = pendingTranslate.y;

    ctx.drawImage(canvas, dx, dy);

    // I'll have to actually think about this.
    if (max_iter < 500) {
      const xmin = dx > 0 ? 0 : Math.max(0, WIDTH + dx),
        xmax = dx > 0 ? Math.min(WIDTH, dx) : WIDTH,
        ymin = dy > 0 ? 0 : Math.max(0, HEIGHT + dy),
        ymax = dy > 0 ? Math.min(HEIGHT, dy) : HEIGHT;

      if (xmax > xmin && ymax > ymin) {
        draw(xmin, xmax, ymin, ymax);
      }
    }

    isRendering = false;
  });
}

let dragging = false,
  lastX,
  lastY;

let pointers = new Map();
let lastPan = null;

// Your pointer code uses:
// e.offsetX
// e.offsetY
// On mobile + CSS scaling, these can be wrong.
// Safer:
// const rect = canvas.getBoundingClientRect();
// const x = e.clientX - rect.left;
// const y = e.clientY - rect.top;
// I’d strongly recommend switching now before zoom/pinch starts drifting.

function get_pointer_coordinates(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, get_pointer_coordinates(e));
});

canvas.addEventListener("pointerup", (e) => {
  pointers.delete(e.pointerId);
  lastPan = null;
});

canvas.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  lastPan = null;
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;

  const offset = get_pointer_coordinates(e);
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, offset);

  // ONE finger → translate
  if (pointers.size === 1) {
    if (!lastPan) {
      lastPan = prev;
      return;
    }
    const dx = offset.x - lastPan.x;
    const dy = offset.y - lastPan.y;
    translate(dx, dy);
    lastPan = offset;
  }
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const offset = get_pointer_coordinates(e);
    zoom(offset.x, offset.y, Math.pow(1.01, e.deltaY));
  },
  { passive: false }
);

let lastPinchDist = null;

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, get_pointer_coordinates(e));

  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    const dist = Math.hypot(dx, dy);

    if (lastPinchDist) {
      const scale = dist / lastPinchDist;

      // zoom around midpoint
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;

      zoom(cx, cy, scale);
    }

    lastPinchDist = dist;
  } else {
    lastPinchDist = null;
  }
});

// // Translation
// let isRendering = false;
// let pendingTranslate = { x: 0, y: 0 };

// function translate(dx, dy) {
//   const d_real = (dx * (max.re - min.re)) / WIDTH,
//     d_imag = (dy * (max.im - min.im)) / HEIGHT;
//   min.re -= d_real;
//   max.re -= d_real;
//   min.im -= d_imag;
//   max.im -= d_imag;

//   pendingTranslate.x = dx;
//   pendingTranslate.y = dy;

//   if (isRendering && max_iter > 500) {
//     ctx.drawImage(canvas, -dx, -dy);
//     return;
//   }

//   isRendering = true;
//   requestAnimationFrame(() => {
//     const dx = pendingTranslate.x,
//       dy = pendingTranslate.y;

//     ctx.drawImage(canvas, dx, dy);

//     // I'll have to actually think about this.
//     if (max_iter < 500) {
//       const xmin = dx > 0 ? 0 : Math.max(0, WIDTH + dx),
//         xmax = dx > 0 ? Math.min(WIDTH, dx) : WIDTH,
//         ymin = dy > 0 ? 0 : Math.max(0, HEIGHT + dy),
//         ymax = dy > 0 ? Math.min(HEIGHT, dy) : HEIGHT;

//       if (xmax > xmin && ymax > ymin) {
//         draw(xmin, xmax, ymin, ymax);
//       }
//     }

//     isRendering = false;
//   });
// }

// let dragging = false,
//   lastX,
//   lastY;
// canvas.onmousedown = (e) => {
//   dragging = true;
//   lastX = e.offsetX;
//   lastY = e.offsetY;
// };
// canvas.onmouseleave = () => {
//   dragging = false;
// };
// canvas.onmousemove = (e) => {
//   if (!dragging) return;
//   const d_x = e.offsetX - lastX,
//     d_y = e.offsetY - lastY;
//   translate(d_x, d_y);
//   lastX = e.offsetX;
//   lastY = e.offsetY;
// };
// canvas.onmouseup = () => {
//   dragging = false;
// };

addEventListener("keydown", (e) => {
  switch (e.key) {
    case "-":
      max_iter -= ITER_UNIT;
      if (max_iter < ITER_UNIT) max_iter = ITER_UNIT;
      draw();
      break;

    case "+":
      max_iter += ITER_UNIT;
      draw();
      break;

    case "r":
      max_iter = ITER_UNIT;
      draw();
      break;

    default:
      break;
  }
});

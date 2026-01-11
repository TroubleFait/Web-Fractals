import { initWebGL } from "./utils/webGL.js";
import { setupControls } from "./utils/controls.js";
import { cAdd, cSub, cScalMul } from "./utils/complex.js";

main();

const initialBounds = {
  reMin: -2.0,
  reMax: 1.0,
  imMin: -1.2,
  imMax: 1.2,
};

async function main() {
  const { gl, canvas, program, positionBuffer } = await initWebGL(
    "./shaders/vertex.vert",
    "./shaders/fragment.frag"
  );

  const currentView = getViewport(initialBounds, canvas);

  let panStartView = null;
  const onPointDown = (pointer) => {
    panStartView = structuredClone(currentView);
  };
  const onPan = (pointer) => {
    const pxPanDist = {
      x: pointer.current.x - pointer.start.x,
      y: pointer.current.y - pointer.start.y,
    };
    const cPanDist = pxToComplex(pxPanDist, canvas, currentView);

    currentView.center = cAdd(panStartView.center, cPanDist);
    draw();
  };

  // DEBUG
  let debugPointTimeout = null;

  const onZoom = (focus, delta) => {
    const oldScale = currentView.scale,
      newScale = currentView.scale / Math.pow(1.01, delta);

    currentView.scale = newScale;

    const complexFocus = pxToComplex(focus, canvas, currentView),
      distToCenter = cSub(currentView.center, complexFocus),
      newDistToCenter = cScalMul(distToCenter, newScale / oldScale);

    // DEBUG
    clearTimeout(debugPointTimeout);
    debugPoints[PointTypes.WHEEL][0] = complexFocus.re;
    debugPoints[PointTypes.WHEEL][1] = complexFocus.im;
    const onTimeout = () => {
      debugPoints[PointTypes.WHEEL][0] = Infinity;
      debugPoints[PointTypes.WHEEL][1] = Infinity;
    };
    debugPointTimeout = setTimeout(onTimeout, 50);

    currentView.center = cAdd(complexFocus, newDistToCenter);
    draw();
  };
  const onPanZoom = (pointers) => {
    /**
     * Cannot panZoom yet
     */
  };

  setupControls(canvas, onPointDown, onPan, onZoom, onPanZoom);

  const uCenterLoc = gl.getUniformLocation(program, "u_center");
  const uScaleLoc = gl.getUniformLocation(program, "u_scale");
  const uAspect = gl.getUniformLocation(program, "u_aspect");

  // DEBUG
  const uDebugPoints = gl.getUniformLocation(program, "u_debugPoints");
  const uDebugColors = gl.getUniformLocation(program, "u_debugColors");
  const uDebugCount = gl.getUniformLocation(program, "u_debugCount");
  const uDebugPointSize = gl.getUniformLocation(program, "u_debugPointSize");

  const PointTypes = {
    WHEEL: 5,
    POINTER_1: 6,
    POINTER_2: 7,
    EXTRA_1: 8,
    EXTRA_2: 9,
  };
  const debugPoints = [
    [canvas.width / 2, canvas.height / 2],
    [0, canvas.height],
    [canvas.width, canvas.height],
    [0, 0],
    [canvas.width, 0],
    [Infinity, Infinity], // wheel
    [Infinity, Infinity], // pointer1
    [Infinity, Infinity], // pointer2
    [Infinity, Infinity], // bonus1
    [Infinity, Infinity], // bonus2
  ];
  convertDebugPoint = (point) => {
    const complexPoint = pxToComplex(
      { x: point[0], y: point[1] },
      canvas,
      currentView
    );
    point[0] = complexPoint.re;
    point[1] = complexPoint.im;
  };
  debugPoints.forEach(convertDebugPoint);
  const debugColors = [
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0],
    [0.0, 1.0, 1.0],
    [1.0, 0.0, 0.0],
    [1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0],
    [1.0, 1.0, 1.0],
    [0.5, 0.5, 0.0],
    [0.5, 0.0, 0.5],
    [0.0, 0.5, 0.5],
  ];

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  function draw() {
    // DEBUG
    gl.uniform2fv(uDebugPoints, new Float32Array(debugPoints.flat()));
    gl.uniform3fv(uDebugColors, new Float32Array(debugColors.flat()));
    gl.uniform1i(uDebugCount, debugPoints.length);
    gl.uniform1f(uDebugPointSize, 0.1);

    gl.uniform2f(uCenterLoc, currentView.center.re, currentView.center.im);
    gl.uniform1f(uScaleLoc, currentView.scale);
    gl.uniform1f(uAspect, currentView.aspect);

    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices for 2 triangles (full-screen quad)
  }

  draw();

  // // Scale test
  // setInterval(() => {
  //   currentView.scale *= 1.1;
  //   draw();
  // }, 1000);

  // // Slide test
  // setInterval(() => {
  //   const cSlide = pxToComplex({ x: -10, y: 50 }, canvas, currentView);

  //   currentView.center = cAdd(currentView.center, cSlide);
  //   draw();
  // }, 1000);
}

/**
 *
 * @param {{
 *    reMin: number,
 *    reMax: number,
 *    imMin: number,
 *    imMax: number
 * }} initialBounds of the complex plane
 * @param {{
 *    width: number, height: number
 * }} canvas
 * @returns {{
 *    center: complex, scale: number, aspect: number
 * }}
 *
 * @returns `center` the center of the complex plane
 * @returns `scale` the visible width of the complex plane
 * @returns `aspect` the visible `width / height`
 */
function getViewport(initialBounds, canvas) {
  let boundsWidth = initialBounds.reMax - initialBounds.reMin;
  const boundsHeight = initialBounds.imMax - initialBounds.imMin;

  const boundsAspect = boundsWidth / boundsHeight,
    canvasAspect = canvas.width / canvas.height;

  if (boundsAspect < canvasAspect) {
    boundsWidth = boundsHeight * canvasAspect;
  }

  const center = {
    re: (initialBounds.reMax + initialBounds.reMin) / 2,
    im: (initialBounds.imMax + initialBounds.imMin) / 2,
  };
  const scale = boundsWidth;
  const aspect = canvasAspect;

  return { center, scale, aspect };
}

function pxToComplex({ x, y }, canvas, view) {
  /**
   * v_c = u_center + u_scale * vec2(uv.x, uv.y / u_aspect);
   * This works
   *
   * x in px
   * X is such that X(-0.5) = x(0 px) and X(0.5) = x(canvasWidth px)
   * X = x / canvasWidth - 0.5
   *
   * y in px
   * Y is such that Y(-0.5) = y(canvasHeight px) and Y(0.5) = y(0 px)
   * Y = 0.5 - y / canvasHeight
   *
   * -0.5 * scale = reMin, 0.5 * scale = reMax
   * re = X * scale
   * im = Y * scale / aspect
   *
   * re = ((x / canvasWidth) - 0.5) * scale
   * im = ((y / canvasHeight - 0.5)) * scale / aspect
   */
  const canvasPoint = {
    x: x / canvas.width - 0.5,
    y: 0.5 - y / canvas.height,
  };

  return cAdd(view.center, {
    re: canvasPoint.x * view.scale,
    im: (canvasPoint.y * view.scale) / view.aspect,
  });
}

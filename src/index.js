import { initWebGL } from "./utils/webGL.js";
import { setupControls } from "./utils/controls.js";
import { cAdd, cSub, cScalMul, cScalDiv } from "./utils/complex.js";

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
  const onZoom = (focus, delta) => {
    const oldScale = currentView.scale,
      newScale = currentView.scale / Math.pow(1.01, delta);

    currentView.scale = newScale;

    const complexFocus = pxToComplex(focus, canvas, currentView),
      distToCenter = cSub(currentView.center, complexFocus),
      newDistToCenter = cScalMul(distToCenter, newScale / oldScale);

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

  // const debugPoints = [
  //   [canvas.width / 2, canvas.height / 2],
  //   [0, canvas.height],
  //   [canvas.width, canvas.height],
  //   [0, 0],
  //   [canvas.width, 0],
  // ];
  // debugPoints.forEach((point) => {
  //   const complexPoint = pxToComplex(
  //     { x: point[0], y: point[1] },
  //     canvas,
  //     currentView
  //   );
  //   point[0] = complexPoint.re;
  //   point[1] = complexPoint.im;
  // });
  // // {
  // //   const complexPoint = pxToComplex(
  // //     { x: debugPoints[0][0], y: debugPoints[0][1] },
  // //     canvas,
  // //     currentView
  // //   );
  // //   point[0] = complexPoint.re;
  // //   point[1] = complexPoint.im;
  // // }
  // console.log("complex debug points:", debugPoints);
  const debugPoints = [
    [-0.5, 0.0],
    [-2.0, -1.2],
    [1.0, -1.2],
    [-2.0, 1.2],
    [1.0, 1.2],
  ];
  const debugColors = [
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0],
    [0.0, 1.0, 1.0],
    [1.0, 0.0, 0.0],
    [1.0, 0.0, 1.0],
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

function getViewport(bounds, canvas) {
  let boundsWidth = bounds.reMax - bounds.reMin;
  const boundsHeight = bounds.imMax - bounds.imMin;

  const boundsAspect = boundsWidth / boundsHeight,
    canvasAspect = canvas.width / canvas.height;

  if (boundsAspect < canvasAspect) {
    boundsWidth = boundsHeight * canvasAspect;
  }

  const center = {
    re: (bounds.reMax + bounds.reMin) / 2,
    im: (bounds.imMax + bounds.imMin) / 2,
  };
  const scale = boundsWidth;
  const aspect = canvasAspect;

  return { center, scale, aspect };
}

function pxToComplex({ x, y }, canvas, view) {
  const pxDistCanvasCenterToPoint = {
    x: x - canvas.width / 2,
    y: y - canvas.height / 2,
  };

  console.log("point", { x, y });
  console.log("pxDistCanvasCenterToPoint", pxDistCanvasCenterToPoint);
  console.log("view", view);
  console.log("before scaling", {
    re: pxDistCanvasCenterToPoint.x,
    // im: pxDistCanvasCenterToPoint.y / view.aspect,
    im: pxDistCanvasCenterToPoint.y,
  });
  console.log(
    "return ",
    cScalMul(
      {
        re: pxDistCanvasCenterToPoint.x,
        // im: pxDistCanvasCenterToPoint.y / view.aspect,
        im: pxDistCanvasCenterToPoint.y,
      },
      view.scale / canvas.width
    )
  );

  return cScalMul(
    {
      re: pxDistCanvasCenterToPoint.x,
      // im: pxDistCanvasCenterToPoint.y / view.aspect,
      im: pxDistCanvasCenterToPoint.y,
    },
    view.scale / canvas.width
  );
}

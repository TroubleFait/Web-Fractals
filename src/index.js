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
    "./shaders/vertex.glsl",
    "./shaders/fragment.glsl"
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

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  function draw() {
    gl.uniform2f(uCenterLoc, currentView.center.re, currentView.center.im);
    gl.uniform1f(uScaleLoc, currentView.scale);
    gl.uniform1f(uAspect, currentView.aspect);

    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices for 2 triangles (full-screen quad)
  }

  draw();

  // setInterval(() => {
  //   currentView.scale *= 1.1;
  //   draw();
  // }, 1000);

  setInterval(() => {
    const cSlide = pxToComplex({ x: -10, y: 50 }, canvas, currentView);

    currentView.center = cAdd(currentView.center, cSlide);
    draw();
  }, 1000);
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
  const distToCanvasCenter = {
    x: canvas.width / 2 - x,
    y: canvas.height / 2 - y,
  };

  return cScalMul(
    {
      re: distToCanvasCenter.x,
      im: distToCanvasCenter.y / view.aspect,
    },
    view.scale
  );
}

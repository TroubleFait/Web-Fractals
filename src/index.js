import { initWebGL } from "./utils/webGL.js";
import { setupControls } from "./utils/controls.js";
import { cAdd, cSub, cScalMul } from "complex";

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
  const onPan = (pointer) => {
    /**
     * Must register the panStartView at the start of the movement
     * so that it can always refer to it as currentView changes
     * tricky, might need to do it at pointerdown and pointerup
     */
  };
  const onZoom = (focus, delta) => {
    /**
     * Change the currentView's center and scale such that focus stays in-place.
     *
     * CF0 = [center0, focus], CF1 = [center1, focus], s0 = old scale, s1 = new scale
     * CF1 / s1 = CF0 / s0
     * center1 =?
     * CF1 = s1 * CF0 / s0
     * (center1 - focus) = (center0 - focus) * s1 / s0
     * center1 = focus + (center0 - focus) * s1 / s0
     */

    const oldScale = currentView.scale;
    currentView.scale /= Math.pow(1.01, delta);

    const distToCenter = cSub(currentView.center, focus);
    currentView.center = cAdd(
      focus,
      cScalMul(distToCenter, currentView.scale / oldScale)
    );
  };
  const onPanZoom = (pointers) => {};

  setupControls(canvas, onPan, onZoom, onPanZoom);

  const uCenterLoc = gl.getUniformLocation(program, "u_center");
  const uScaleLoc = gl.getUniformLocation(program, "u_scale");
  const uAspect = gl.getUniformLocation(program, "u_aspect");

  gl.uniform2f(uCenterLoc, currentView.center.re, currentView.center.im);
  gl.uniform1f(uScaleLoc, currentView.scale);
  gl.uniform1f(uAspect, currentView.aspect);

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  function draw() {
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices for 2 triangles (full-screen quad)
  }

  draw();
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

import { initWebGL } from "./utils/webGL";

main();

const initialBounds = {
  reMin: -2.0,
  reMax: 1.0,
  imMin: -1.2,
  imMax: 1.2,
};

async function main() {
  const gl = await initWebGL(
    "./shaders/vertex.glsl",
    "./shaders/fragment.glsl"
  );

  const uViewport = getViewport(initialBounds, canvas);

  const uCenterLoc = gl.getUniformLocation(program, "u_center");
  const uScaleLoc = gl.getUniformLocation(program, "u_scale");
  const uAspect = gl.getUniformLocation(program, "u_aspect");

  gl.uniform2f(uCenterLoc, uViewport.center.re, uViewport.center.im);
  gl.uniform1f(uScaleLoc, uViewport.scale);
  gl.uniform1f(uAspect, uViewport.aspect);

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices for 2 triangles (full-screen quad)
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

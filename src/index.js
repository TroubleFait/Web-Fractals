main();

function main() {
  const canvas = document.querySelector("#glCanvas");
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;

  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert(
      "WebGL initialisation impossible. Your browser or machine cannot support it."
    );
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 0.0, 0.0, 1.0); // DEBUG: red
  // gl.clearColor(0.0, 0.0, 0.0, 1.0); // PRODUCTION: black
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

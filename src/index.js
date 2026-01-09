main();

function main() {
  const canvas = document.querySelector("#glCanvas");

  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert(
      "WebGL initialisation impossible. Your browser or machine cannot support it."
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

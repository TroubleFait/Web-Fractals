main();

async function main() {
  const vertexShaderSource = await loadShaderSource("./shaders/vertex.glsl");
  const fragmentShaderSource = await loadShaderSource(
    "./shaders/fragment.glsl"
  );

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

  const positions = new Float32Array([
    -1,
    -1, //  bottom-left

    1,
    -1, //  bottom-right

    -1,
    1, //   top-left

    -1,
    1, //   top-left

    1,
    -1, //  bottom-right

    1,
    1, //   top-right
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  const xminLoc = gl.getUniformLocation(program, "xmin");
  const xmaxLoc = gl.getUniformLocation(program, "xmax");
  const yminLoc = gl.getUniformLocation(program, "ymin");
  const ymaxLoc = gl.getUniformLocation(program, "ymax");

  gl.uniform1f(xminLoc, -2.0);
  gl.uniform1f(xmaxLoc, 1.0);
  gl.uniform1f(yminLoc, -1.2);
  gl.uniform1f(ymaxLoc, 1.2);

  const aPosition = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vertices for 2 triangles (full-screen quad)
}

async function loadShaderSource(url) {
  const res = await fetch(url);
  return await res.text();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

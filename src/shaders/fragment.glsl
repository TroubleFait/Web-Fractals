// fragment shader
precision mediump float;
varying vec2 v_uv;

void main() {
    // Red gradient from left to right, green from top to bottom
    gl_FragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0);
}

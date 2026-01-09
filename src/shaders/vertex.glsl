// Vertex shader
// attribute vec2 a_position;
// varying vec2 v_uv;
varying vec2 v_c; // the actual complex coordinate
uniform float xmin, xmax, ymin, ymax; // the viewport in the complex plane

void main() {
    // // Pass normalized coordinates to fragment shader
    // v_uv = a_position * 0.5 + 0.5; // map from [-1,1] to [0,1]

    // // gl_Position must be vec4
    // gl_Position = vec4(a_position, 0.0, 1.0);

    vec2    uv = a_position * 0.5 + 0.5; // map from [-1,1] to [0,1]
    v_c = vec2(
        mix(xmin, xmax, uv.x),
        mix(ymin, ymax, uv.y)
    );

    gl_Position = vec4(a_position, 0.0, 1.0);
}

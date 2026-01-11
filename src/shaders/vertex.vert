// Vertex shader
attribute vec2  a_position;

uniform vec2    u_center;
uniform float   u_scale, u_aspect;

varying vec2    v_c; // the actual complex coordinate

// DEBUG
varying vec2    v_uv; // the canvas coordinates, mapped

void main() {
    // // Pass normalized coordinates to fragment shader
    // v_uv = a_position * 0.5 + 0.5; // map from [-1,1] to [0,1]

    // // gl_Position must be vec4
    // gl_Position = vec4(a_position, 0.0, 1.0);

    vec2    uv = a_position * 0.5; // map from [-1,1] to [-0.5,0.5]

    // DEBUG
    v_uv = uv;

    // map to complex plane
    v_c = u_center + u_scale * vec2(uv.x, uv.y / u_aspect);

    gl_Position = vec4(a_position, 0.0, 1.0);
}

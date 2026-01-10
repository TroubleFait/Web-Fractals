// fragment shader
precision highp float;
// varying vec2 v_uv;
varying vec2    v_c; // the actual complex coordinate
const int       MAX_ITER = 100;

vec2 cMul(vec2 a, vec2 b) {
    // return mat2(a, -a.y, a.x) * b;
    return vec2(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

float cSquaredAbs(vec2 z) {
    // return Math.sqrt(z.re * z.re + z.im * z.im);
    return dot(z, z);
}

vec2 f(vec2 z, vec2 c) {
    return cMul(z, z) + c;
}

int iterations(vec2 c, int max) {
    vec2 z = vec2(0.0);
    int n;
    for (n = 0; n < max; ++n) {
        if (cSquaredAbs(z) > 4.0) return n;
        z = f(z, c);
    }
    return max;
}

void main() {
    // // Red gradient from left to right, green from top to bottom
    // gl_FragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0);

    float   brightness = float(iterations(v_c, MAX_ITER)) / MAX_ITER;
    gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
}

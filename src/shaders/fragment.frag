// fragment shader
precision highp float;
varying vec2    v_c; // the actual complex coordinate
const int       MAX_ITER = 100;

// DEBUG
const int       MAX_POINTS = 10;

uniform vec2    u_debugPoints[MAX_POINTS];
uniform vec3    u_debugColors[MAX_POINTS];
uniform int     u_debugCount;
uniform float   u_debugPointSize;

// varying vec2    v_uv;

// DEBUG
vec4 debugPointsColor() {
    vec3    energy = vec3(0.0);
    float   mask = 0.0;

    for (int i = 0; i < MAX_POINTS; ++i) {
        if (!(i < u_debugCount)) break;

        float   d = distance(v_c, u_debugPoints[i]) * 10;
        float   influence = smoothstep(0.0, u_debugPointSize, u_debugPointSize - d);

        energy += influence * u_debugColors[i];
        mask = max(mask, influence);
    }
    float   m = max(energy.r, max(energy.g, energy.b));
    vec3    rgbColor = energy / (1.0 + m);

    return vec4(rgbColor, mask);
}

vec2 cMul(vec2 a, vec2 b) {
    return vec2(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

float cSquaredAbs(vec2 z) {
    return dot(z, z);
}

vec2 f(vec2 z) {
    return cMul(z, z) + v_c;
}

int iterations() {
    vec2    z = vec2(0.0);
    int     n = 0;

    for (int i = 0; i < MAX_ITER; ++i) {
        if (cSquaredAbs(z) > 4.0) break;
        z = f(z);
        ++n;
    }

    return n;
}

void main() {
    // // Red gradient from left to right, green from top to bottom
    // gl_FragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0);

    vec3    brightness = vec3(float(iterations()) / float(MAX_ITER));

    // DEBUG
    vec4    debugColor = debugPointsColor();

    // gl_FragColor = vec4(brightness, 1.0);
    gl_FragColor = vec4(
        mix(brightness, debugColor.rgb, debugColor.a),
        1.0
    );

    // gl_FragColor = vec4(        // mapping test
    //     (v_c.x + 2.0) / 3.0,    // normalize x from [-2,1] → [0,1]
    //     (v_c.y + 1.2) / 2.4,    // normalize y from [-1.2,1.2] → [0,1]
    //     0.0,
    //     1.0
    // );
}

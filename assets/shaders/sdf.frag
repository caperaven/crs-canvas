precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform float min;
uniform float max;

void main(void) {
    float dist = texture(texture1, v_uv).r;
    float alpha = smoothstep(min, max, dist); // 0.01, 0.5, dist 0.3, 1.0
    glFragColor = vec4(v_color.rgb, alpha);
}
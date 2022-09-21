precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform vec3 customColor;

const float width = 0.0;
const float edge = 0.5;

void main(void) {
    float distance = 1. - texture(texture1, v_uv).a;
    float alpha = 1.0 - smoothstep(width, width + edge, distance);
    glFragColor = vec4(v_color.rgb, alpha);
}
precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform float min;
uniform float max;

float edge = 0.2;

void main(void) {
    float dist = texture(texture1, v_uv).r;
    float alpha = smoothstep(min - edge, max + edge, dist);
    glFragColor = vec4(v_color.rgb, alpha);
}
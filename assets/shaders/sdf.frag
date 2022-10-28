precision highp float;

// varying
varying vec2 v_uv;

// uniform
uniform sampler2D texture1;
uniform float min;
uniform float max;
uniform vec3 color;

float edge = 0.2;

void main(void) {
    float dist = texture(texture1, v_uv).r;
    float alpha = smoothstep(min - edge, max + edge, dist);
    glFragColor = vec4(color.rgb, alpha);
}
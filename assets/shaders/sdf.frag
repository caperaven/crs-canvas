precision highp float;

// varying
in vec2 vUV;

// uniform
uniform sampler2D texture1;

const float width = 0.0;
const float edge = 0.5;
const vec3 color = vec3(1.0, 0.0, 0.0);

void main(void) {
    float distance = 1. - texture(texture1, vUV).a;

    float alpha = 1.0 - smoothstep(width, width + edge, distance);

    glFragColor = vec4(color, alpha);
}
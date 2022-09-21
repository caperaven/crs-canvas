precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform vec3 customColor;

const float width = 0.0;
const float edge = 0.5;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

vec3 greyscale(vec3 color, float str) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), str);
}

void main(void) {
//    float distance = 1. - texture(texture1, v_uv).a;
//    float alpha = 1.0 - smoothstep(width, width + edge, distance);
//    glFragColor = vec4(v_color.rgb, alpha);

    vec3 color = texture(texture1, v_uv).rgb;
    vec3 gray = greyscale(color, 1.0);
    float alpha = median(gray.r, gray.g, gray.b);

    float factor = smoothstep(0.0, 0.5, alpha);
    glFragColor = vec4(0., 0., 0., alpha);
}
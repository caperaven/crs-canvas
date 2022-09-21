precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform vec3 customColor;

const float pxRange = 1.0;
const vec4 bgColor = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 fgColor = vec4(1.0, 0.0, 0.0, 1.0);

float screenPxRange() {
    vec2 unitRange = vec2(pxRange)/vec2(textureSize(texture1, 0));
    vec2 screenTexSize = vec2(1.0)/fwidth(v_uv);
    return max(0.5*dot(unitRange, screenTexSize), 1.0);
}

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

vec4 drawBody() {
    vec3 pick = texture2D(texture1, v_uv).rgb;
    float sigDist = median(pick.r, pick.g, pick.b) - 0.5;
    float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
    return vec4(bgColor.xyz, alpha);
}

void main(void) {
    vec4 body = drawBody();
    glFragColor = body;
}
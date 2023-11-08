precision highp float;

// varying
varying vec2 v_uv;
varying vec4 v_color;

// uniform
uniform sampler2D texture1;
uniform float min;
uniform float max;

uniform float u_buffer;
uniform float u_edge;

void main(void) {
    float dist = texture(texture1, v_uv).r;
    float alpha = smoothstep(u_buffer - u_edge, u_buffer + u_edge, dist);
    glFragColor = vec4(v_color.rgb, alpha);
}
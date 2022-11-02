precision highp float;

// attributes
attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;

// uniforms
uniform mat4 worldViewProjection;

// varyings
varying vec2 v_uv;
varying vec4 v_color;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    v_uv = uv;
    v_color = color;
}
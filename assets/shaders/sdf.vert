precision highp float;

// attributes
attribute vec3 position;
attribute vec2 uv;

// uniforms
uniform mat4 worldViewProjection;

// varyings
varying vec2 vUV;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
}
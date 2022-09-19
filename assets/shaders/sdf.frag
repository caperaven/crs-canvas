precision highp float;

// varying
varying vec2 vUV;

// uniform
uniform sampler2D texture1;

void main(void) {
    gl_FragColor = texture(texture1, vUV);
}
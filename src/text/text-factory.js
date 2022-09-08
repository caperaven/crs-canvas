export class TextFactory {
    constructor(scene, readyCallback) {
        const path = "./src/text/textures/Roboto-Regular";
        const fontPng = `${path}.png`;
        const fontSpec = `${path}.json`;

        this.scene = scene;
        this.fontTexture= new BABYLON.Texture(fontPng, scene);

        BABYLON.Effect.ShadersStore['fontFragmentShader'] = shaders.fragment;
        BABYLON.Effect.ShadersStore['fontVertexShader'] = shaders.vertex;

        this.material = new BABYLON.ShaderMaterial("shader", scene, {
                vertex: "font",
                fragment: "font",
            },
            {
                attributes: ["position", "normal", "uv", "customColor", "fontUv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "viewProjection", "font"],
                needAlphaBlending: true
            });

        this.material.setTexture("font", this.fontTexture);


        fetch(fontSpec).then((response)=> {
            response.json().then(data => {
                this.fontData = data;
                readyCallback();
            })
        })
    }

    dispose() {
        this.fontTexture.dispose();
        this.fontTexture = null;
        this.material.dispose();
        this.material = null;
        this.fontData = null;
        delete this.scene;
    }


    async create(text, scale, color, position = {x: 0, y: 0}) {
        let bufferUvs = genUvs(text, this.fontData)
        let bufferMatrices = genMatrices(text, this.fontData, position, scale)
        let bufferColors = genSameColor(text, color)
        let textPlane =  BABYLON.MeshBuilder.CreatePlane("plane", {height: 1, width: 1});

        textPlane.thinInstanceSetBuffer('matrix', bufferMatrices, 16)
        textPlane.thinInstanceSetBuffer("customColor", bufferColors, 4);
        textPlane.thinInstanceSetBuffer("fontUv", bufferUvs, 4)
        textPlane.material = this.material
        return textPlane
    }
}



function genBaseMatrix(glyph) {
    let originShiftMatrix = BABYLON.Matrix.Translation(0.5, 0.5, 0)
    if (!glyph.planeBounds) return originShiftMatrix
    let selectWidth = glyph.planeBounds.right - glyph.planeBounds.left
    let selectHeight = glyph.planeBounds.top - glyph.planeBounds.bottom
    let scaleMatrix = BABYLON.Matrix.Scaling(selectWidth, selectHeight, 1.0)
    return originShiftMatrix.multiply(scaleMatrix)
}

function genUvs(s, fontData) {
    let bufferFontUv = new Float32Array(4 * s.length)
    s.split('').forEach((c, index) => {
        let fontUv = fontData.atlasUvs[c]
        bufferFontUv.set(fontUv, index * 4)
    })
    return bufferFontUv
}

function genMatrices(s, fontData, position, scale) {
    // x offset of character (relative to line origin)
    let x = 0
    let bufferMatrices = new Float32Array(16 * s.length)
    s.split('').forEach((c, i) => {
        let glyph = fontData.chars[c]

        // Create the right shape rectangle for the character and make the character origin bottom left
        let baseMatrix = genBaseMatrix(glyph)

        // Scaling
        let scalingMatrix = BABYLON.Matrix.Scaling(scale, scale, 1.0)

        let bottom = glyph.planeBounds.bottom
        let left = glyph.planeBounds.left
        // Placement of a character relative to the other characters in the line
        let layoutMatrix = BABYLON.Matrix.Translation(
            x + left * scale,
            bottom * scale,
            0.0);
        // x offset of next character
        x += glyph.advance * scale

        // Offset of the line
        let originMatrix = BABYLON.Matrix.Translation(position.x, position.y, 0)

        // Scale char rectangle
        let scaled = baseMatrix.multiply(scalingMatrix)
        // Move the rectangle relative to the other characters
        let relative = scaled.multiply(layoutMatrix)
        // Move by the line offset
        let final = relative.multiply(originMatrix)

        final.copyToArray(bufferMatrices, i * 16);
    })
    return bufferMatrices
}

function genSameColor(s, color) {
    let bufferColors = new Float32Array(4 * s.length)
    for (var i = 0; i < s.length; i++) {
        bufferColors[i * 4] = color.r;
        bufferColors[i * 4 + 1] = color.g;
        bufferColors[i * 4 + 2] = color.b;
        bufferColors[i * 4 + 3] = color.a;
    }
    return bufferColors
}




const shaders = Object.freeze({
    vertex: `
        precision highp float;

        // Attributes
        attribute vec3 position;
        attribute vec2 uv;
        attribute vec4 customColor;
        attribute vec4 fontUv;

        // Uniforms
        uniform mat4 viewProjection;

        // Varying
        varying vec2 vUV;
        varying vec4 vColor;

        #include<instancesDeclaration>

        void main(void) {
            #include<instancesVertex>
            
            gl_Position = viewProjection * finalWorld * vec4(position, 1.0);
            vUV = vec2(fontUv.x + uv.x * fontUv.z, fontUv.y + uv.y * fontUv.w);
            vColor = customColor;
        }`,
    fragment: `
    precision highp float;

        varying vec2 vUV;
        varying vec4 vColor;

        uniform sampler2D font;

        #include<instancesDeclaration>

        float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
        }

        void main(void) {
            vec3 pick = texture2D(font, vUV).rgb;
            float sigDist = median(pick.r, pick.g, pick.b) - 0.5;
            float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(vColor.xyz, alpha);
            if (gl_FragColor.a < 0.1) discard;
        }
    `
})
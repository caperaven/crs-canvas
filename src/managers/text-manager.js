import {font as regularFont} from "./utils/font.js"
import {font as boldFont} from "./utils/font_bold.js";

class TextManager {
    #regular;
    #bold;

    constructor() {
        this.#regular = {};
        this.#bold = {};
    }

    has(text, bold = false) {
        if (bold == true) {
            return this.#bold[text] != null;
        }

        return this.#regular[text] != null;
    }

    get(text, bold = false) {
        if (bold == true) {
            return this.#bold[text];
        }

        return this.#regular[text];
    }

    set(text, mesh, bold = false) {
       if (bold == true) {
           return this.#bold[text] = mesh;
       }

       this.#regular[text] = mesh;
    }

    delete(text, bold = false) {
        if (bold == true) {
            delete this.#bold[text];
        }

        delete this.#regular[text];
    }
}

export class TextManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const text = await crs.process.getValue(step.args.text, context, process, item);
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const attributes = await crs.process.getValue(step.args.attributes, context, process, item);
        const bold = await crs.process.getValue(step.args.bold, context, process, item);

        const scene = canvas.__layers[layer];
        const font = bold == true ? boldFont : regularFont;

        const data = new BABYLON.VertexData();
        data.positions = [];
        data.indices = [];
        data.uvs = [];
        data.normals = [];

        let xadvance = 0;
        let c = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char == " ") {
                xadvance += 0.3;
                continue;
            }

            const charData = getCharData(font, char, xadvance, c * 4);
            data.positions.push(...charData.positions);
            data.indices.push(...charData.indices);
            data.uvs.push(...charData.uvs);
            data.normals.push(...charData.normals);
            xadvance += charData.xadvance;
            c += 1;
        }

        const customMesh = new BABYLON.Mesh(text, scene);
        data.applyToMesh(customMesh);
        customMesh.position.set(position.x || 0, position.y || 0, position.z || 0);

        customMesh.scaling.x = 0.5;
        customMesh.scaling.y = 0.5;

        const name = bold == true ? "text_bold" : "text_regular";
        const texture = bold == true ? "textures/sdf_font_bold.png" : "textures/sdf_font.png";

        const material = await crs.call("gfx_materials", "get_shader", {
            element: canvas,
            id: "sdf",
            name: name,
            texture: texture,
            attributes: attributes
        });

        customMesh.material = material;
        return customMesh;
    }
}

function getCharData(font, char, pO, ind) {
    const charData = font.chars[char];
    const width = charData.width;
    const height = charData.height;
    const u1 = charData.u1;
    const u2 = charData.u2;
    const v1 = charData.v1;
    const v2 = charData.v2;
    const xoffset = charData.xoffset;
    const yoffset = charData.yoffset;

    const positions = [
        pO + xoffset, yoffset - height, 0,
        pO + width + xoffset, yoffset - height, 0,
        pO + xoffset, yoffset, 0,
        pO + width + xoffset, yoffset, 0
    ]

    const indices = [ind + 0, ind + 1, ind + 2, ind + 1, ind + 3, ind + 2];
    const uvs = [u1, v1, u2, v1, u1, v2, u2, v2];
    const normals = [];

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);

    return {
        positions: positions,
        indices: indices,
        normals: normals,
        uvs: uvs,
        xadvance: charData.xadvance
    }
}

crs.intent.gfx_text = TextManagerActions;
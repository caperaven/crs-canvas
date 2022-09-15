import {font} from "./utils/font.js"

export class TextManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const text = await crs.process.getValue(step.args.text, context, process, item);
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const scene = canvas.__layers[layer];

        const data = new BABYLON.VertexData();
        data.positions = [];
        data.indices = [];
        data.uvs = [];
        data.normals = [];

        let xOffset = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charData = getCharData(font, char, xOffset, i * 4);
            data.positions.push(...charData.positions);
            data.indices.push(...charData.indices);
            data.uvs.push(...charData.uvs);
            data.normals.push(...charData.normals);

            xOffset += 1;
        }

        const customMesh = new BABYLON.Mesh(text, scene);
        data.applyToMesh(customMesh);
        customMesh.position.set(position.x || 0, position.y || 0, position.z || 0);

        const material = await crs.call("gfx_materials", "get_textured", {
            element: canvas,
            id: "font",
            texture: "textures/font.png"
        });

        customMesh.material = material;
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

    const positions = [
        pO, 0, 0,
        pO + width, 0, 0,
        pO, height, 0,
        pO + width, height, 0
    ]

    const indices = [ind + 0, ind + 1, ind + 2, ind + 1, ind + 3, ind + 2];
    //const uvs =   [0, 0, 1,  0,  0,  1,  1,  1];
    const uvs = [u1, v1, u2, v1, u1, v2, u2, v2];
    const normals = [];

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);

    return {
        positions: positions,
        indices: indices,
        normals: normals,
        uvs: uvs
    }
}

crs.intent.gfx_text = TextManagerActions;
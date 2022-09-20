import {normalize} from "./utils/normalize.js"

class SDFGlyphsManager {
    constructor() {
        this.atlases = {};
    }

    dispose() {
        this.atlases = null;
    }

    async add(shader, atlas, glyph, scale, position, canvas, scene) {
        // JHR: todo, check if this glyph already exists and if it does, create a instance instead.

        if (this.atlases[atlas] == null) {
            const material = await crs.call("gfx_materials", "get_shader", {
                element: canvas,
                id: shader,
                texture: `sdf/${atlas}.png`
            });

            const json = await fetch(`${crs.intent.gfx.assetsLocation}/sdf/${atlas}.json`).then(result => result.json());
            this.atlases[atlas] = {
                material: material,
                reference: json
            }
        }

        const atlasData = this.atlases[atlas];
        const glyphData = atlasData.reference.glyphs[glyph];
        const common = atlasData.reference.common;

        const nx = normalize(glyphData.x, 0, atlasData.reference.common.scaleW);
        const ny = normalize(glyphData.y, 0, atlasData.reference.common.scaleH);
        const width = normalize(common.glyph_scale, 0, common.scaleW);
        const height = normalize(common.glyph_scale, 0, common.scaleH);

        const vertexData = getVertexData(scale, nx, ny, width, height);
        const customMesh = new BABYLON.Mesh(glyph, scene);
        vertexData.applyToMesh(customMesh);
        customMesh.position.set(position.x || 0, position.y || 0, position.z || 0);
        customMesh.material = atlasData.material;
    }
}

export class SDFGlyphsManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__sdfIcons = new SDFGlyphsManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__sdfIcons = canvas.__sdfIcons?.dispose();
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const scale = (await crs.process.getValue(step.args.scale, context, process, item)) || 1;
        const atlas = await crs.process.getValue(step.args.atlas, context, process, item);
        const glyph = await crs.process.getValue(step.args.glyph, context, process, item);
        const shader = (await crs.process.getValue(step.args.shader, context, process, item) || "sdf");

        return await canvas.__sdfIcons.add(shader, atlas, glyph, scale, position, canvas, scene);
    }
}

function getVertexData(scale, nx, ny, width, height) {
    const data = new BABYLON.VertexData();
    data.positions = [
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
        1, 1, 0];

    data.indices = [0, 1, 2, 1, 3, 2];

    const x1 = nx;
    const y1 = 1 - ny - height;
    const x2 = x1 + width;
    const y2 = y1 + height;

    data.uvs = [
        x1, y1,
        x2, y1,
        x1, y2,
        x2, y2
    ];

    data.normals = [];
    BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);

    return data;
}

crs.intent.gfx_sdf_icon = SDFGlyphsManagerActions;
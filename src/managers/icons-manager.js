import {getCharData} from "./utils/char-data.js";
import {font} from "./font-atlas/icons.js";

class IconsManager {
    #icons;

    get icons() {
        return this.#icons;
    }

    constructor() {
        this.#icons = {};
    }

    dispose() {
        for (const key of Object.keys(this.icons)) {
            this.#icons[key].dispose();
        }

        this.#icons = null;
    }

    async add(icon, mesh) {
        this.#icons[icon] = mesh;
    }

    has(name) {
        return this.#icons[name] != null;
    }

    clone(name) {
        const result = this.#icons[name].clone();
        result.material = this.#icons[name].material;
        return result;
    }
}

export class IconsManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas._icons = new IconsManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas._icons = canvas._icons?.dispose();
    }

    static async add(step, context, process, item) {
        const icon = await crs.process.getValue(step.args.icon, context, process, item);
        const canvas = await crs.dom.get_element(step, context, process, item);

        // if (canvas._icons.has(icon)) {
        //     return canvas._icons.clone(icon);
        // }

        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const scale = (await crs.process.getValue(step.args.scale, context, process, item)) || 1;
        const attributes = await crs.process.getValue(step.args.attributes, context, process, item);
        const kerning = await crs.process.getValue(step.args.kerning || false, context, process, item);
        const color = await crs.process.getValue(step.args.color || {r: 1, g: 1, b:1, a: 1}, context, process, item);

        const charData = getCharData(font, icon);

        const data = new BABYLON.VertexData();
        data.positions = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];
        data.indices = [0, 1, 2, 1, 3, 2];
        data.uvs = charData.uvs;
        data.normals = charData.normals;

        data.colors = [];
        for (let i = 0; i < data.positions.length; i += 3) {
            data.colors.push(color.r, color.g, color.b, color.a);
        }

        const customMesh = new BABYLON.Mesh(icon, scene);
        data.applyToMesh(customMesh);

        const ydiff = kerning == true ? 0.25 : 0; //1 - charData.yoffset : 0;

        customMesh.position.set(position.x || 0, position.y + ydiff || ydiff, position.z || 0);
        customMesh.scaling.x = scale;
        customMesh.scaling.y = scale;

        const name = "icons";
        const texture = "textures/icons_font.png";

        const material = await crs.call("gfx_materials", "get_shader", {
            element: canvas,
            id: "sdf",
            name: name,
            texture: texture,
            attributes: attributes
        });

        customMesh.material = material;

        //await canvas._icons.add(icon, customMesh);

        return customMesh;
    }
}

crs.intent.gfx_icons = IconsManagerActions;
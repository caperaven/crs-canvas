import {getCharData} from "./utils/char-data.js";
import {font} from "./font-atlas/icons.js";

class IconsManager {
    constructor() {
        this.icons = {};
    }

    dispose() {
        this.icons = null;
    }

    async add() {
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
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const scale = (await crs.process.getValue(step.args.scale, context, process, item)) || 1;
        const icon = await crs.process.getValue(step.args.icon, context, process, item);
        const attributes = await crs.process.getValue(step.args.attributes, context, process, item);

        const charData = getCharData(font, icon);

        const data = new BABYLON.VertexData();
        data.positions = charData.positions;
        data.indices = charData.indices;
        data.uvs = charData.uvs;
        data.normals = charData.normals;

        const customMesh = new BABYLON.Mesh(icon, scene);
        data.applyToMesh(customMesh);

        customMesh.position.set(position.x || 0, position.y || 0, position.z || 0);
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
        return customMesh;
    }
}

crs.intent.gfx_icons = IconsManagerActions;
class MaterialsManager {
    constructor() {
        this.store = {}
    }

    dispose() {
        const keys = Object.keys(this.store);
        for (const key of keys) {
            this.store[key].dispose();
        }
        this.store = null;
    }

    get(value, diffuse, scene) {
        if (this.store[value] == null) {
            const color = BABYLON.Color3.FromHexString(value);
            const material = new BABYLON.StandardMaterial(value, scene);

            if (diffuse) {
                material.diffuseColor = color;
            }
            else {
                material.emissiveColor = color;
            }

            this.store[value] = material;
        }

        return this.store[value];
    }
}

class MaterialsManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__materials = new MaterialsManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__materials = canvas.__materials?.dispose();
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const value = await crs.process.getValue(step.args.value, context, process, item);
        const diffuse = await crs.process.getValue(step.args.diffuse, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        return canvas.__materials.get(value, diffuse, scene);
    }
}

crs.intent.gfx_materials = MaterialsManagerActions;

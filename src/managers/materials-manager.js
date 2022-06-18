class MaterialsManager {
    constructor(scene) {
        this.store = {
            "transparent": new BABYLON.StandardMaterial("#000000", scene)
        }

        this.store.transparent.diffuseColor = BABYLON.Color3.FromHexString("#ff0010");
        this.store.transparent.alpha = 0;
    }

    dispose() {
        const keys = Object.keys(this.store);
        for (const key of keys) {
            this.store[key].dispose();
        }
        this.store = null;
    }

    get(id, value, diffuse, scene) {
        if (this.store[id] == null) {
            const color = BABYLON.Color3.FromHexString(value);
            const material = new BABYLON.StandardMaterial(value, scene);

            if (diffuse) {
                material.diffuseColor = color;
            }
            else {
                material.emissiveColor = color;
            }

            this.store[id] = material;
        }

        return this.store[id];
    }

    /**
     * JHR: Note
     * use material id, if id not given use material color or texture name
     * get must not assume color
     * add set function
     */
}

class MaterialsManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        canvas.__materials = new MaterialsManager(canvas.__layers[layer]);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__materials = canvas.__materials?.dispose();
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const value = await crs.process.getValue(step.args.value, context, process, item);
        const diffuse = await crs.process.getValue(step.args.diffuse, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        return canvas.__materials.get(id, value, diffuse, scene);
    }
}

crs.intent.gfx_materials = MaterialsManagerActions;

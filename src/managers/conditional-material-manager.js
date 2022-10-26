class ConditionalMaterialManager {
    #store;

    constructor() {
        this.#store = {};
    }

    dispose() {
        for (const key of Object.keys(this.#store)) {
            this.#store[key] = null;
        }

        this.#store = null;
    }

    async getMaterial(expression, model, canvas, layer, diffuse) {
        if (this.#store[expression] == null) {
            this.#store[expression] = await crs.call("compile", "if_value", {exp: expression});
        }

        let value = this.#store[expression](model);

        if (value.indexOf("#") == -1) {
           value = canvas._theme[value];
        }

        return await crs.call("gfx_materials", "get", {
            element: canvas,
            id: value,
            layer,
            value,
            diffuse
        });
    }
}

class ConditionalMaterialManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__cdn_materials = new ConditionalMaterialManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__cdn_materials = canvas.__cdn_materials?.dispose();
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const condition = await crs.process.getValue(step.args.condition, context, process, item);
        const model = await crs.process.getValue(step.args.model, context, process, item);
        const diffuse = await crs.process.getValue(step.args.diffuse, context, process, item);

        return await canvas.__cdn_materials.getMaterial(condition, model, canvas, layer, diffuse);
    }
}

crs.intent.gfx_conditional_materials = ConditionalMaterialManagerActions;
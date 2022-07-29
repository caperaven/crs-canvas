class ThinInstances {

}

class InstanceManager {
    constructor() {
        this.store = {};
    }

    dispose() {
        return null;
    }

    async add(id, positions, mesh, material, canvas) {
        let instance = this.store[id]?.[0];
        if (instance == null) {
            instance = (await crs.call("gfx_mesh_factory", "create", {element: canvas, mesh: mesh, material: material}))[0];
            this.store[id] = [instance]
        }

        for (const position of positions) {
            const matrix = BABYLON.Matrix.Translation(position.x, position.y, position.z);
            const idx = instance.thinInstanceAdd(matrix);
            this.store[id].push(idx);
        }
    }

    async remove(id, index, count) {
        let items = this.store[id];
        items.splice(index, count);
    }

    async clear() {

    }
}

class InstanceManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__instances = new InstanceManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__instances = canvas.__instances.dispose();
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const positions = await crs.process.getValue(step.args.positions, context, process, item);
        const mesh = await crs.process.getValue(step.args.mesh, context, process, item);
        const material = await crs.process.getValue(step.args.material, context, process, item);

        if (canvas.__instances == null) {
            await this.initialize(step, context, process, item);
        }

        await canvas.__instances.add(id, positions, mesh, material, canvas)
    }

    static async remove(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const index = await crs.process.getValue(step.args.index, context, process, item);
        const count = await crs.process.getValue(step.args.count, context, process, item);
        await canvas.__instances.remove(id, index, count);
    }
}

crs.intent.gfx_instances = InstanceManagerActions;

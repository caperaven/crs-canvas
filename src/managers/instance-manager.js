class InstanceManager {
    constructor() {
        this.store = {};
    }

    dispose() {
        return null;
    }

    add() {

    }

    remove() {

    }

    clear() {

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
        //... get stuff
        // need mesh manager
        canvas.__instances.add(id, positions, createMeshCallback)
    }
}

crs.intent.gfx_instances = InstanceManagerActions;

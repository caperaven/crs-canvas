class InstanceManager {
    constructor() {
        this.store = {};
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
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        //... get stuff

        canvas.__instances.add()
    }
}

crs.intent.gfx_instances = InstanceManagerActions;

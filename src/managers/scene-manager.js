export class SceneManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async remove(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const name = await crs.process.getValue(step.args.name, context, process, item)
        const scene = canvas.__layers[layer];

        let mesh;
        if (name != null) {
            mesh = scene.getMeshByName(name);
        }
        else {
            const id = await crs.process.getValue(step.args.id, context, process, item)
            mesh = scene.getMeshesById(id);
        }

        if (mesh != null) {
            mesh.dispose();
        }
    }
}

crs.intent.gfx_scene = SceneManagerActions;
import "./../meshes/custom-geometry.js";

class GeometryManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const data = await crs.process.getValue(step.args.data, context, process, item);
        const name = (await crs.process.getValue(step.args.name, context, process, item)) || "custom_geometry";
        const position = await crs.process.getValue(step.args.position);
        const color = await crs.process.getValue(step.args.color);
        const diffuse = (await crs.process.getValue(step.args.diffuse) || false);
        const scene = canvas.__layers[layer];

        let material = null;
        if (color != null) {
            material = await crs.call("gfx_materials", "get", {
                element: canvas,
                value: color,
                diffuse: diffuse
            })
        }

        BABYLON.MeshBuilder.CreateGeometry(name, { data: data, position: position, material: material }, scene);
    }
}

crs.intent.gfx_geometry = GeometryManagerActions;
class MeshFactoryManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async create(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const mesh = await crs.process.getValue(step.args.mesh, context, process, item);
        const scene = canvas.__layers[layer];
        let positions = (await crs.process.getValue(step.args.positions, context, process, item)) || [{x: 0, y: 0, z: 0}];

        const material_def = await crs.process.getValue(step.args.material, context, process, item);

        const material = await crs.call("gfx_materials", "get", {
            element: canvas,
            id: material_def.id,
            value: material_def.color
        })

        const instances = [];
        for (const position of positions) {
            const instance = await createMesh(mesh.name || "mesh", mesh.type || "plane", mesh.options, scene, position);
            instance.material = material;
            instances.push(instance);
        }

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, instances, context, process, item);
        }

        return instances;
    }
}

export async function createMesh(name, type, options, scene, position) {
    type = type.charAt(0).toUpperCase() + type.slice(1);
    const mesh = BABYLON.MeshBuilder[`Create${type}`](name, options, scene);
    mesh.position.set(position.x, position.y, position.z);
    mesh.freezeWorldMatrix();
    return mesh;
}

crs.intent.gfx_mesh_factory = MeshFactoryManagerActions;
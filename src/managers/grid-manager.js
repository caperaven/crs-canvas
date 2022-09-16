export class GridManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const size = (await crs.process.getValue(step.args.size, context, process, item)) || 200;
        const z = (await crs.process.getValue(step.args.z, context, process, item)) || 0.01;
        const ratio = (await crs.process.getValue(step.args.ratio, context, process, item)) || 0.1;
        const canMove = (await crs.process.getValue(step.args.can_move, context, process, item)) || true;

        const scene = canvas.__layers[0];
        const grid = BABYLON.MeshBuilder.CreatePlane("gfx_grid", { size: size, position: { z: z } }, scene);

        grid.material = new BABYLON.GridMaterial("gfx_grid", scene);
        grid.material.gridRatio = ratio;
        grid.material.mainColor = new BABYLON.Color3(1, 1, 1);
        grid.material.lineColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        grid.enablePointerMoveEvents = canMove;
        grid.position.z = z;
    }

    static async remove(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const scene = canvas.__layers[0];

        const grid = scene.getMeshByName("gfx_grid");
        if (grid != null) {
            grid.dispose();
        }
    }
}

crs.intent.gfx_grid = GridManagerActions;
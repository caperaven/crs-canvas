class CameraManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const type = await crs.process.getValue(step.args.type, context, process, item);
        const attachControls = (await crs.process.getValue(step.args.attach_controls, context, process, item)) || true;
        const scene = canvas.__layers[0];

        const camera = CameraFactory.free(type, scene);
        canvas.__camera = camera;

        if (attachControls == true) {
            camera.attachControl(canvas, true);
        }
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__camera?.dispose();
        canvas.__camera = null;
    }
}

class CameraFactory {
    static free(str, scene) {
        const parts = str.split(",");
        const x = Number(parts[1]);
        const y = Number(parts[2]);
        const z = Number(parts[3]);

        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(x, y, z), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        return camera;
    }
}

crs.intent.gfx_camera = CameraManagerActions;

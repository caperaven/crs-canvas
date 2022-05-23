class CameraManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const type = await crs.process.getValue(step.args.type, context, process, item);
        const attachControls = (await crs.process.getValue(step.args.attach_controls, context, process, item)) || true;
        const scene = canvas.__layers[0];

        const camera = CameraFactory.create(type, scene);
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
    static create(str, scene) {
        const parts = str.split(",");
        return this[parts[0]](parts, scene);
    }

    static free(parts, scene) {
        const x = Number(parts[1]);
        const y = Number(parts[2]);
        const z = Number(parts[3]);

        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(x, y, z), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        return camera;
    }

    static rotate(parts, scene) {
        const alpha = Number(parts[1]);
        const beta = Number(parts[2]);
        const radius = Number(parts[3]);
        const target = new BABYLON.Vector3(0, 0, 0);
        const camera = new BABYLON.ArcRotateCamera("camera", alpha, beta, radius, target, scene)
        return camera;
    }
}

crs.intent.gfx_camera = CameraManagerActions;

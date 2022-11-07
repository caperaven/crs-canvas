import { CustomPanInput} from "./inputs/camera-pan-input.js";

class CameraManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const type = await crs.process.getValue(step.args.type, context, process, item);
        const attachControls = (await crs.process.getValue(step.args.attach_controls, context, process, item)) || true;
        const scene = canvas.__layers[0];

        const camera = await CameraFactory.create(type, scene);
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
        const x = Number(parts[1]);
        const y = Number(parts[2]);
        const radius = Number(parts[3]);
        const target = new BABYLON.Vector3(0, 0, 0);
        const camera = new BABYLON.ArcRotateCamera("camera", 0, 0,radius, target, scene)
        camera.setPosition(new BABYLON.Vector3(x, y, -radius));
        return camera;
    }

    static pan(parts, scene) {
        const allowXPan = Number(parts[1] || 1);
        const allowYPan = Number(parts[2] || 1);

        const target = new BABYLON.Vector3(0, 0, 0);

        const halfPI = Math.PI / 2;
        const camera = new BABYLON.ArcRotateCamera("camera", -halfPI,halfPI, 9, target, scene);

        camera.zoomToMouseLocation = true;
        camera.upperAlphaLimit = -halfPI;
        camera.lowerAlphaLimit = -halfPI;
        camera.upperBetaLimit = halfPI;
        camera.lowerBetaLimit = halfPI;
        camera.wheelPrecision = 20;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50;
        camera.panningAxis = new BABYLON.Vector3(allowXPan, allowYPan, 0);

        let prevRadius = camera.radius;
        scene.onBeforeRenderObservable.add(() => {
            let ratio = 0;
            if (prevRadius != camera.radius) {
                ratio = prevRadius / camera.radius;
                prevRadius = camera.radius;
                camera.panningSensibility *= ratio;
                camera.wheelPrecision *= ratio;
            }
        });

        return camera;
    }

    static async custom_pan(parts, scene) {
        //WIP
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -15), scene);

        camera.attachControl(scene, true);
        camera.inputs.remove(camera.inputs.attached.mouse);
        camera._input =  new CustomPanInput(scene, camera);
        camera.inputs.attached.keyboard.keysDown = [];
        camera.inputs.attached.keyboard.keysUp = [];
        camera.__forceDisableControls = true;
        camera.minZ = 1;
        camera.maxZ = 15;

        globalThis.camera = camera; // remove this when done testing camera
        return camera;
    }
}

crs.intent.gfx_camera = CameraManagerActions;

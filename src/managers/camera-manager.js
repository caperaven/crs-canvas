import {CameraPanInputActions} from "./inputs/camera-pan-input.js";

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

        if (camera.__forceDisableControls === true || attachControls == true) {
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
        const betaPos = Math.PI / 2;
        const allowXPan = Number(parts[1] || 1);
        const allowYPan = Number(parts[2] || 1);

        const target = new BABYLON.Vector3(0, 0, 0);
        const camera = new BABYLON.ArcRotateCamera("camera", 0,0, 0, target, scene)

        camera.position =  new BABYLON.Vector3(0, 0, 20);
        camera.zoomToMouseLocation = true;
        camera.upperAlphaLimit = -betaPos;
        camera.lowerAlphaLimit = -betaPos;
        camera.upperBetaLimit = betaPos;
        camera.lowerBetaLimit = betaPos;
        camera.wheelPrecision = 20;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50;
        camera.panningInertia = 0;
        camera.panningSensibility = 50;
        camera.panningDistanceLimit = 50;
        camera.panningAxis = new BABYLON.Vector3(allowXPan, allowYPan, 0)

        return camera;
    }

    static async custom_pan(parts, scene) {
        const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 0, -250), scene);

        camera.attachControl(scene, true);
        camera.inputs.remove(camera.inputs.attached.mouse);

        await CameraPanInputActions.enable(scene, camera);
        camera.__forceDisableControls = true;
        return camera;
    }
}

crs.intent.gfx_camera = CameraManagerActions;

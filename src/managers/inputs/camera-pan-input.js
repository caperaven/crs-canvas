export class CameraPanInputActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async enable(scene, camera) {
        const pan = {
            max_z: -250, min_z: -1, zoom_speed: 0.001
        }

        camera.pan = pan;
        scene.onPointerObservable.add((pointerInfo) => {
            const fnName = pointerMap[pointerInfo.type];
            CameraPanInputActions[fnName]?.(scene, camera, pointerInfo);
        });
    }

    static async disable(scene, camera) {
        delete camera.pan;
        delete camera.__dragging;
    }

    static async pointer_down(scene, camera) {
        camera.__dragging = true;
        scene.defaultCursor = "grabbing";
        camera.pan.lastPosition = new BABYLON.Vector3(scene.pointerX, scene.pointerY, 0)
    }

    static async pointer_move(scene, camera) {
        if (camera.__dragging) {
            const pos = new BABYLON.Vector2(scene.pointerX, scene.pointerY);

            const xdir = camera.pan.lastPosition.x - pos.x;
            const ydir = camera.pan.lastPosition.y - pos.y;

            const speed = 0.001 * -camera.position.z; // We do this to adjust the speed as you zoom out;

            camera._localDirection.set(speed * xdir, speed * -ydir, 0);
            camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
            BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
            camera.position.addInPlace(camera._transformedDirection);
            camera.pan.lastPosition.set(scene.pointerX, scene.pointerY, 0);

        }
    }

    static async pointer_wheel(scene, camera, pointerInfo) {
        // TODOS:
        // Add camera max and min zoom level
        // Cache vector to save on memory
        // Get zoom in and out position on par with Miro

        const zoom_speed = 0.01;
        const engine = scene.getEngine();


        const sensibility = 0.0015;

        const halfWidth = engine.getRenderWidth() / 2
        const halfHeight = engine.getRenderHeight() / 2

        const pointerX = scene.pointerX; // We apply the * 1 minus to make it a negative number
        const pointerY = scene.pointerY;

        const xOffset = (halfWidth - pointerX) * -1 * sensibility;
        const yOffset = (halfHeight - pointerY) * sensibility;

        const zOffset = -pointerInfo.event.deltaY * zoom_speed;

        const cameraViewMatrix = camera.getViewMatrix();

        const newVector3 = BABYLON.Vector3.Zero().copyFromFloats(xOffset, yOffset, zOffset);

        cameraViewMatrix.invertToRef(camera._cameraTransformMatrix); // Set cameraTransformMatrix to view matrix
        BABYLON.Vector3.TransformNormalToRef(newVector3, camera._cameraTransformMatrix, camera._transformedDirection);
        camera.cameraDirection.addInPlace(camera._transformedDirection);

    }

    static async pointer_up(scene, camera) {
        camera.__dragging = false;
        scene.defaultCursor = "grab";
    }
}

const pointerMap = Object.freeze({
    1: "pointer_down",
    2: "pointer_up",
    4: "pointer_move",
    8: "pointer_wheel",
    16: "pointer_pick",
    32: "pointer_tap",
    64: "pointer_double_tap"
});
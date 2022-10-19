export class CustomPanInput {
    #pointerObserver;
    #lastPosition;

    #max_z = -250;
    #min_z = -1;
    #zoom_speed = 0.001;

    #camera;
    #scene;

    #pointerHandler;


    constructor(scene, camera) {
        this.pointerFns = {
            pointer_down: this.#pointer_down.bind(this),
            pointer_move: this.#pointer_move.bind(this),
            pointer_up: this.#pointer_up.bind(this),
            pointer_wheel: this.#pointer_wheel.bind(this)
        }
        this.#camera = camera;
        this.#scene = scene;

        this.#pointerHandler = this.#pointerEvent.bind(this);

        this.#pointerObserver = this.#scene.onPointerObservable.add(this.#pointerHandler);
    }

    dispose() {
        this.#camera = null;
        this.#scene = null;
        this.#lastPosition = null;
        this.#pointerObserver = this.#scene.onPointerObservable.remove(this.#pointerHandler);
        this.#pointerHandler = null;
    }

    #pointerEvent(pointerInfo) {
        const fnName = pointerMap[pointerInfo.type];
        this.pointerFns[fnName]?.(pointerInfo);
    }


    async #pointer_down() {
        this.#camera.__dragging = true;
        this.#scene.defaultCursor = "grabbing";
        this.#lastPosition = new BABYLON.Vector3(this.#scene.pointerX, this.#scene.pointerY, 0)
    }

    async #pointer_move(pointerInfo) {
        if (this.#camera.__dragging) {

            const xdir = this.#lastPosition.x - this.#scene.pointerX;
            const ydir = this.#lastPosition.y - this.#scene.pointerY;

            const speed = 0.0011 * -this.#camera.position.z; // We do this to adjust the speed as you zoom out;

            let xDelta = speed * xdir;
            let yDelta = speed * -ydir;


            // if ((this.#camera.position.x + xDelta) < this.#camera.offset_x) {
            //     xDelta = 0;
            // }

            if ((this.#camera.position.y + yDelta) > this.#camera.offset_y) {
                yDelta = 0;
            }

            this.#camera._localDirection.set(xDelta, yDelta, 0);
            this.#camera.getViewMatrix().invertToRef(this.#camera._cameraTransformMatrix);

            BABYLON.Vector3.TransformNormalToRef(this.#camera._localDirection, this.#camera._cameraTransformMatrix, this.#camera._transformedDirection);
            this.#camera.position.addInPlace(this.#camera._transformedDirection);

            this.#lastPosition.set(this.#scene.pointerX, this.#scene.pointerY, 0);

        }
    }

    async #pointer_wheel(pointerInfo) {

        return;

        // TODOS:
        // Add camera max and min zoom level
        // Cache vector to save on memory
        // Get zoom in and out position on par with Miro
        console.log(camera.getProjectionMatrix());
        const zoom_speed = 0.001;
        const engine = this.#scene.getEngine();


        const sensibility = 0.0001;

        const halfWidth = engine.getRenderWidth() / 2
        const halfHeight = engine.getRenderHeight() / 2

        const pointerX = this.#scene.pointerX; // We apply the * 1 minus to make it a negative number
        const pointerY = this.#scene.pointerY;

        const xOffset = (halfWidth - pointerX) * -1 * sensibility;
        const yOffset = (halfHeight - pointerY) * sensibility;

        const zOffset = -pointerInfo.event.deltaY * zoom_speed;

        const cameraViewMatrix = this.#camera.getViewMatrix();

        const newVector3 = BABYLON.Vector3.Zero().copyFromFloats(xOffset, yOffset, zOffset);

        cameraViewMatrix.invertToRef(this.#camera._cameraTransformMatrix); // Set cameraTransformMatrix to view matrix
        BABYLON.Vector3.TransformNormalToRef(newVector3, camera._cameraTransformMatrix, camera._transformedDirection);
        this.#camera.cameraDirection.addInPlace(camera._transformedDirection);

    }

    async #pointer_up() {
        this.#camera.__dragging = false;
        this.#scene.defaultCursor = "grab";
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
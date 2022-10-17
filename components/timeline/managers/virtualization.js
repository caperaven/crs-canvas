import {SizeManager} from "./size-manager.js";

export class Virtualization {
    #camera;
    #canvas;
    #size;
    #sizeManager;
    #indexes;
    #renderSize;
    #addCallback;
    #removeCallback;
    #lastY;
    #busy;

    constructor(canvas, camera, size, items, addCallback, removeCallback) {
        this.#canvas = canvas;
        this.#camera = camera;
        this.#size = size;
        this.init();
        this.#sizeManager = new SizeManager(() => { });

        const count = items.length;

        this.#indexes = new Array(count);
        this.#sizeManager.fill(this.#size, count);

        this.#addCallback = addCallback;
        this.#removeCallback = removeCallback;
    }

    dispose() {
        this.#camera = null;
        this.#canvas = null;
        this.#size = null;
        this.#sizeManager = null;
        this.#indexes = null;
    }

    init() {
        this.#camera.onViewMatrixChangedObservable.addOnce(() => {
           this.#renderSize = Math.abs(this.#camera.view_height / this.#size + this.#camera.view_height / 2);
        });

        this.#camera.onViewMatrixChangedObservable.add(async (camera) => {
            const cameraY = this.#camera.position.y / -1;
            await this.move(cameraY);
        });
    }

    async move(cameraY) {
        cameraY = Math.round(cameraY * 1) / 1;

        if(cameraY === this.#lastY) return;

        if(this.#busy === true) {
            return;
        }

        this.#busy = true;

        const offset = (this.#renderSize * this.#size) / 4;

        const topY = cameraY - offset;

        const itemY =  Math.max(0, topY);

        const items = this.#sizeManager.getAtSizeLocation(itemY, this.#renderSize);

        const first = items[0];
        const last = items[items.length - 1];

        let minIndex = first.dataIndex;
        let maxIndex = last.dataIndex;

        this.#lastY = cameraY;

        for (const item of items) {
            const value = this.#indexes[item.dataIndex];

            if(value == null) {
                this.#indexes[item.dataIndex] = await this.#addCallback(item);
            }
        }

        for (let i = 0; i < this.#indexes.length; i++) {
            if (i < minIndex || i > maxIndex) {

                const value = this.#indexes[i];
                if (value != null) {
                    await this.#removeCallback(value);
                    this.#indexes[i] = null;
                }
            }
        }
        this.#busy = false;
    }
}


import {SizeManager} from "./size-manager.js";

export class Virtualization {
    #camera;
    #canvas;
    #size;
    #items;
    #sizeManager;
    #indexes;
    #renderSize;

    #lastY;

    constructor(canvas, camera, size, items, addCallback, removeCallback) {
        this.#canvas = canvas;
        this.#camera = camera;
        this.#size = size;
        this.#items = items;
        this.init();
        this.#sizeManager = new SizeManager(() => { });

        const count = 100000 //items.length * 100000;

        console.log(count);

        this.#indexes = new Array(count);
        this.#sizeManager.fill(this.#size, count);

        globalThis.sizeManager = this;
    }

    dispose() {
        this.#camera = null;
        this.#canvas = null;
        this.#size = null;
        this.#items = null;
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

        const offset = (this.#renderSize * this.#size) / 2;

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
                this.#indexes[item.dataIndex] = await this.addMesh(item);
            }
        }

        for (let i = 0; i < this.#indexes.length; i++) {
            const value = this.#indexes[i];
            if(value != null) {
                if(i < minIndex || i > maxIndex) {
                    value.dispose();
                    this.#indexes[i] = null;
                }
            }
        }
    }


    async addMesh(item) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: this.#canvas,
            mesh: {
                id: `${item.dataIndex}_my_mesh`,
                type: "plane",
                options: {
                    width: Math.random() * (3 - 1) + 1,
                    height: this.#size - 0.05
                },
            },
            material: {
                id: "my_colo2r",
                color: "#0000ff"
            },
            positions: [{x: 2, y: item.position / -1 - (this.#size / 2), z: 0}]
        })

        return meshes[0];
    }
}


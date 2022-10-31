import {SizeManager} from "./size-manager.js";

export class DynamicVirtualization {
    #instances = {};
    #position;
    #busy;
    #buffer;
    #frustum;

    #addCallback;
    #removeCallback;
    #sizeManager;
    #lastDrawPosition;

    constructor(items, frustum, addCallback, removeCallback) {
        this.#addCallback = addCallback;
        this.#removeCallback = removeCallback;

        this.#sizeManager = new SizeManager(()=> {});
        this.#sizeManager.append(items);

        this.#buffer = 5 //this.#size * Math.abs(frustum);
        this.#frustum = frustum;
    }

    dispose() {
        this.#instances = null;
        this.#position = null;
        this.#buffer = null;
        this.#addCallback = null;
        this.#removeCallback = null;
    }

    async draw(position) {

        if (this.#busy === true) return;
        const roundedPosition = Math.round(position * 10) / 10;
        if (this.#position === roundedPosition) return;
        this.#busy = true;

        this.#position = roundedPosition;
        await this.#drawForCurrent()

        this.#busy = false;
    }

    async #drawForCurrent() {

        const sizeItems =  this.#sizeManager.getAtSizeLocation(this.#position, 8);

        if(this.#lastDrawPosition ===  sizeItems[0].position) return;

       this.#lastDrawPosition = sizeItems[0].position;

        const startPoint = sizeItems[0].position;

        for (const sizeItem of sizeItems) {
            if (this.#instances[sizeItem.position] == null) {
                const result = await this.#addCallback(sizeItem.position,sizeItem.index);
                this.#instances[sizeItem.position] = result;
            }
        }

        const keys = Object.keys(this.#instances);

        for (const key of keys) {
            if (key < startPoint || key > sizeItems[sizeItems.length-1].position) {
                this.#removeCallback(this.#instances[key]);
                delete this.#instances[key];
            }
        }
    }
}
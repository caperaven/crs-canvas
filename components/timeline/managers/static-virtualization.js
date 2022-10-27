export class StaticVirtualization {
    #size;
    #roundValue;
    #instances = {};
    #position;
    #busy;
    #buffer;
    #frustum;

    #addCallback;
    #removeCallback;

    constructor(size, frustum, addCallback, removeCallback) {
        this.#size = size;
        this.#addCallback = addCallback;
        this.#removeCallback = removeCallback;

        this.#buffer =  5 //this.#size * Math.abs(frustum);
        this.#frustum = frustum;

        const parts = this.#size.toString().split(".");
        this.#roundValue = Math.pow(10, parts[1]?.length || 0);
    }

    dispose() {
        this.#size = null;
        this.#roundValue = null;
        this.#instances = null;
        this.#position = null;
        this.#buffer = null;
        this.#addCallback = null;
        this.#removeCallback = null;
    }

    async draw(position) {

        if(this.#busy === true) return;
        const roundedPosition = Math.round(position * this.#roundValue) / this.#roundValue;
        if (this.#position === roundedPosition) return;
        this.#busy = true;

        this.#position = roundedPosition;
        await this.#drawForCurrent()

        this.#busy = false;
    }

    async #drawForCurrent() {
        const startPoint = Math.floor(this.#position / this.#size) * this.#size;
        const endPoint = startPoint + this.#size;

        if (this.#position > startPoint && this.#position < endPoint) return;

        const startDrawPosition = startPoint - this.#buffer;
        const endDrawPosition = startPoint + this.#frustum + this.#buffer;

        for (let position = startDrawPosition; position < endDrawPosition; position += this.#size) {
            if (this.#instances[position] == null) {
                const index = Math.floor(position / this.#size);
                const result = await this.#addCallback(position, index);
                this.#instances[position] = result;
            }
        }

        const keys = Object.keys(this.#instances);

        for (const key of keys) {
            if (key < startDrawPosition || key > endDrawPosition) {
                this.#removeCallback(this.#instances[key]);
                delete this.#instances[key];
            }
        }
    }
}
export class StaticVirtualization {

    #cameraX;
    #size;
    #roundValue;
    #instances = {};
    #position;
    #buffer;

    #addCallback;
    #removeCallback;


    dispose() {
        this.#size = null;
        this.#roundValue = null;
        this.#instances = null;
        this.#position = null;
        this.#buffer = null;
    }

    constructor(size, viewPortSize, addCallback, removeCallback) {
        this.#size = size;
        this.#addCallback = addCallback;
        this.#removeCallback = removeCallback;

        this.#buffer = Math.round(viewPortSize / this.#size) / 1.5;

        const parts = this.#size.toString().split(".");
        this.#roundValue = Math.pow(10, parts[1]?.length || 0);
    }

    async draw(position) {
        const roundedPosition = Math.round(position * this.#roundValue) / this.#roundValue;
        if (this.#position === roundedPosition) return;

        this.#position = roundedPosition;

        await this.#drawForCurrent()
    }

    async #drawForCurrent() {
        const startPoint = Math.floor(this.#position / this.#size) * this.#size;
        const endPoint = startPoint + this.#size;

        if (this.#position > startPoint && this.#position < endPoint) return;

        const startDrawPosition = startPoint - (this.#buffer * this.#size);
        const endDrawPosition = endPoint + (this.#buffer * this.#size);

        for (let position = startDrawPosition; position < endDrawPosition; position += this.#size) {
            if (this.#instances[position] == null) {
                const result = await this.#addCallback(position);
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
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

    get instances() {
        return this.#instances;
    }

    constructor(size, frustum, addCallback, removeCallback) {
        this.#size = size;
        this.#addCallback = addCallback;
        this.#removeCallback = removeCallback;

        this.#buffer =  this.#size * 5;
        this.#frustum = frustum;

        const parts = this.#size.toString().split(".");
        this.#roundValue = Math.pow(10, parts[1]?.length || 0);
    }

    dispose() {
        for (const key of Object.keys(this.#instances)) {
            this.#removeCallback(this.#instances[key]);
        }
        this.#size = null;
        this.#roundValue = null;
        this.#instances = null;
        this.#position = null;
        this.#buffer = null;
        this.#addCallback = null;
        this.#removeCallback = null;
    }

    clearInstances() {
        for (const key of Object.keys(this.#instances)) {
            if (this.#instances[key] != null) {
                for (const item of (this.#instances[key])) {
                    if(item?.dispose)
                    {
                        item.dispose();
                    }
                }
            }

            if(this.#instances[key]?.dispose)
            {
                this.#instances[key].dispose();
            }
            delete this.#instances[key];
        }
        this.#position = null;
    }

    async draw(position) {
        if (this.#busy === true) return;
        const roundedPosition = Math.round(position * this.#roundValue) / this.#roundValue;
        if (this.#position === roundedPosition) return;
        this.#busy = true;

        this.#position = roundedPosition;
        await this.#drawForCurrent()

        this.#busy = false;
    }

    async #drawForCurrent() {
        const startPoint = Math.floor(this.#position / this.#size) * this.#size;

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
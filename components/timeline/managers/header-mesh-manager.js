import {createHeaderText, createRect} from "./timeline-helpers.js";

export class HeaderMeshManager {

    #meshStore;

    constructor() {
        this.#meshStore = {};
    }

    dispose() {
        for (const key of Object.keys(this.#meshStore)) {
            this.#meshStore[key].dispose();
        }
    }

    async create(scale, position, index, baseDate, canvas) {
        return this[`#${scale}`](position, index, baseDate, canvas);
    }

    async remove(scale, instance) {
        instance.text.dispose();
        instance.bg.dispose();
    }

    async #day(value) {

    }

    async #week(value) {

    }

    async #month(position, index, baseDate, canvas) {
        const date = new Date(baseDate.getTime());
        date.setDate(date.getDate() + index);
        const key = date.getDate();

        const xText = position + 0.4;
        const xBg = position + 0.5;

        let instance;

        if(this.#meshStore[key] != null) {
            instance = this.#meshStore[key];
            instance.text.position.x = xText;
            instance.bg.position.x = xBg;
        }
        else {
             instance = {
                text: await createHeaderText(key, canvas, xText, -0.82, canvas._text_scale),
                bg: await createRect(key, canvas._theme.header_offset_bg, xBg, -0.75, 0.95, 0.5, canvas)
            }
        }

        return instance;
    }

    async #year(value) {

    }
}


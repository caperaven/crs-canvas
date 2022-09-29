import {ThemeManager} from "./managers/theme-manager.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"
import "./managers/timeline-manager.js";

import {TIMELINE_SCALE} from "./timeline_scale.js";
import {workOrderSamples} from "../../app/timeline/sample_data.js";

export class Timeline extends crsbinding.classes.BindableElement {

    #canvas;

    get html() {
        return import.meta.url.replace(".js", ".html")
    }

    get scale() {
        return this.getProperty('scale');
    }

    set scale(scale) {
        this.setProperty('scale', scale);
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.#canvas = this.querySelector("canvas");
        this.scale = this.scale || 'month';

        await ThemeManager.initialize(this.#canvas);
        const ready = async () => {
            this.#canvas.removeEventListener("ready", ready);
            this.#canvas.__engine.setHardwareScalingLevel(1/ window.devicePixelRatio);
            await this.render();
        }

        if (this.#canvas.dataset.ready == "true") {
            await ready();
        } else {
            this.#canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        this.#canvas = null;
    }

    async render() {
        // const startDate = new Date(2022, 0, 1);
        // const endDate = new Date(2023, 0, 1);


        const scene = this.#canvas.__layers[0];


        const startDate = new Date(2020, 0, 1);
        const endDate = new Date(2022, 11, 31);

        await crs.call("gfx_timeline_manager", "initialize", {
            element: this.#canvas,
            min: startDate,
            max: endDate,
            scale: this.scale
        });

        await crs.call("gfx_timeline_header", "initialize", {element: this.#canvas});

        await crs.call("gfx_timeline_header", "render", {
            element: this.#canvas,
            start_date: startDate,
            end_date: endDate,
            scale: this.scale
        });

        await crs.call("gfx_timeline_rows", "initialize", {element: this.#canvas});

        await crs.call("gfx_timeline_rows", "render", {
            element: this.#canvas,
            items: workOrderSamples,
            start_date: startDate,
            end_date: endDate,
            scale: this.scale
        });
    }

    async setScale(scale) {
        this.scale = scale;
        //TODO KR: add refresh logic
    }
}

customElements.define("crs-timeline", Timeline)
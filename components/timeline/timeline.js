import "./../canvas_2d/canvas_2d.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"
import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";

import {configureCamera} from "./timeline-camera.js";

export class Timeline extends HTMLElement {

    #canvas;
    #startDate;
    #endDate;
    #configuration;
    #scale;
    #data;

    static get observedAttributes() {
        return ["data-scale"];
    }

    async connectedCallback() {
        this.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());
        this.#configuration = await fetch(this.dataset.config).then(result => result.json());

        this.#scale = this.dataset.scale || 'month';

        requestAnimationFrame(async () => {
            this.#canvas = this.querySelector("canvas") || this.canvas;

            const ready = async () => {
                await crs.call("gfx_theme", "set", {
                    element: this.#canvas,
                    theme: this.#configuration.theme
                });

                this.#canvas.removeEventListener("ready", ready);
                this.#canvas.__engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

                await this.#init();
                await crs.call("component", "notify_ready", {element: this});
            }

            if (this.#canvas.dataset.ready == "true") {
                await ready();
            } else {
                this.#canvas.addEventListener("ready", ready);
            }
        })
    }

    async disconnectedCallback() {
        this.#canvas = null;
        this.#configuration = null;
        this.#data = null;
        this.#scale = null;
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-scale") {
            await this.setScale(newValue);
        }
    }

    async #init() {
        this.#startDate = new Date(2022, 0, 1); //TODO GM Dates will be removed. will only use base date
        this.#endDate = new Date(2023, 11, 31);

        await crs.call("gfx_timeline_manager", "initialize", {
            element: this.#canvas,
            min: this.#startDate,
            max: this.#endDate,
            scale: this.#scale
        });

        await crs.call("gfx_text", "initialize", {element: this.#canvas});
        await crs.call("gfx_icons", "initialize", {element: this.#canvas});

        await crs.call("gfx_timeline_header", "initialize", {element: this.#canvas});

        await crs.call("gfx_timeline_rows", "initialize", {element: this.#canvas, config: this.#configuration});

        const scene = this.#canvas.__layers[0];
        const camera = this.#canvas.__camera;
        await configureCamera(camera, scene);
    }

    async render(items) {
        if (items == null || items.length === 0) return;

        this.#data = items; // TODO GM. Need to use data manager for this. We don't want to keep data in memory.

        await crs.call("gfx_timeline_header", "render", {
            element: this.#canvas,
            start_date: this.#startDate,
            end_date: this.#endDate,
            scale: this.#scale
        });

        await crs.call("gfx_timeline_rows", "render", {
            element: this.#canvas,
            items: items,
            start_date: this.#startDate,
            end_date: this.#endDate,
            scale: this.#scale,
            forceRender: true
        });
    }

    async setScale(scale) {
        if (this.#scale == scale) return;
        if (this.#canvas == null || this.#canvas.__headers == null || this.#canvas.__rows == null) return;
        this.#scale = scale;
        await this.clean();
        await this.render(this.#data);
    }

    async clean() {
        await crs.call("gfx_timeline_header", "clean", {element: this.#canvas});
        await crs.call("gfx_timeline_rows", "clean", {element: this.#canvas});
    }
}

customElements.define("crs-timeline", Timeline)
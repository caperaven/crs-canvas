import "./../canvas_2d/canvas_2d.js";
import "./managers/row-manager.js"
import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";

import {configureCamera} from "./timeline-camera.js";
import "./../../src/factory/timeline-shape-factory.js"
import {VirtualizationHeaderManager} from "./managers/headers/virtualization-header-manager.js";
import {RowManager} from "./managers/row-manager.js";

export class Timeline extends HTMLElement {
    #canvas;
    #configuration;
    #scale;
    #data;
    #baseDate;
    #headerManager;
    #rowManager;
    #zIndices = Object.freeze({
        bgBorderMesh: -0.002,
        headerBorder: -0.003,
        headerBg: -0.003,
        headerText: -0.004
    })

    static get observedAttributes() {
        return ["data-scale"];
    }

    async connectedCallback() {
        this.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());
        this.#configuration = await fetch(this.dataset.config).then(result => result.json());

        this.#scale = this.dataset.scale || 'month';

        requestAnimationFrame(async () => {
            this.#canvas = this.querySelector("canvas") || this.canvas;
            this.#canvas.__zIndices = this.#zIndices;

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
        this.#headerManager = this.#headerManager.dispose()
        this.#rowManager = this.#rowManager.dispose()
        this.#canvas = null;
        this.#baseDate = null;
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
        this.#baseDate = new Date(new Date().toDateString());
        this.#headerManager = new VirtualizationHeaderManager(this.#canvas);

        await crs.call("gfx_timeline_manager", "initialize", {
            element: this.#canvas,
            base: this.#baseDate,
            scale: this.#scale
        });

        this.#canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);
        
        await crs.call("gfx_text", "initialize", {element: this.#canvas});
        await crs.call("gfx_icons", "initialize", {element: this.#canvas});

        this.#rowManager = new RowManager(this.#configuration);

        const scene = this.#canvas.__layers[0];
        const camera = this.#canvas.__camera;
        await configureCamera(camera, scene);
    }

    async render(items) {
        if (items == null || items.length === 0) return;

        this.#data = items; // TODO GM. Need to use data manager for this. We don't want to keep data in memory.

        this.#headerManager.init(this.#baseDate, this.#scale, this.#canvas, this.#canvas.__layers[0]);

        this.#rowManager.init(items, this.#canvas, this.#canvas.__layers[0], this.#baseDate, this.#scale);
    }

    async setScale(scale) {
        if (this.#scale === scale) return;
        this.#scale = scale;
        if(this.#data != null) {
            await this.clean();
            await this.draw();
        }
    }

    async draw() {
        await this.#rowManager.redraw(this.#data.length, this.#scale, this.#canvas);
        await this.#headerManager.createHeaders(this.#baseDate, this.#scale, this.#canvas);

        this.#canvas.__camera.position.x = 0;
    }

    async clean() {
        const scene = this.#canvas.__layers[0];
        for (const item of this.#data) {
            delete item.actual_geom;
        }
        await this.#rowManager.clean(this.#canvas, scene);
        await this.#headerManager.removeHeaders();
    }
}

customElements.define("crs-timeline", Timeline)
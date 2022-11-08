import "./../canvas_2d/canvas_2d.js";
import "./managers/row-manager.js"
import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";
import "./../timeline/managers/offset-manager.js";

import {configureCamera} from "./timeline-camera.js";
import "./../../src/factory/timeline-shape-factory.js"
import {VirtualizationHeaderManager} from "./managers/headers/virtualization-header-manager.js";
import {RowManager} from "./managers/row-manager.js";
import {SelectionManager} from "./managers/selection-manager.js";
import {TIMELINE_SCALE} from "./timeline-scale.js";

export class Timeline extends HTMLElement {
    #canvas;
    #configuration;
    #scale;
    #data;
    #baseDate;
    #headerManager;
    #rowManager;
    #selectionManager;
    #zIndices = Object.freeze({
        bgBorderMesh: -0.002,
        headerBorder: -0.003,
        headerBg: -0.003,
        headerText: -0.004,
        rowShape: -0.0005,
        rowText: -0.0006,
        offsetRow: 0,
        selectionMesh: -0.0001,
    })
    #rowSize = 1.25;

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
            this.#canvas.__rowSize = this.#rowSize;
            await crs.call("offset_manager", "initialize", {
                element: this.#canvas,
                offsets: {
                    y: {
                        default_header: 1,
                        year_header: 0.5,
                        default_row: 1.25,
                        year_row: 0.75,
                        default_offset_row: 1.6,
                        year_offset_row: 2.15,
                        default_selection: 0.25,
                        year_selection: -0.5
                    }
                }
            });

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
        this.#headerManager = this.#headerManager.dispose(this.#canvas)
        this.#rowManager = this.#rowManager.dispose()
        await crs.call("offset_manager", "dispose", {element: this.#canvas});
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
        this.#setYOffset();
        this.#selectionManager = new SelectionManager(this.#canvas, (event, index) => {
            if (this.#data[index] == null) return false;
            this.selectedItem = this.#data[index];
            this.selectedIndex = index;
            this.dispatchEvent(new CustomEvent("selection-changed", {
                detail: {
                    item: this.selectedItem,
                    index: this.selectedIndex
                }
            }));
            return true;
        });

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
        this.#selectionManager.init(this.#canvas);
        this.#headerManager.init(this.#baseDate, this.#scale, this.#canvas, this.#canvas.__layers[0]);
    }

    async render(items) {
        if (items == null || items.length === 0) return;

        if (this.#data != null) {
            this.#rowManager.dispose(this.#canvas);
            this.#rowManager = new RowManager(this.#configuration)
        }

        this.#data = items; // TODO GM. Need to use data manager for this. We don't want to keep data in memory.

        this.#rowManager.init(items, this.#canvas, this.#canvas.__layers[0], this.#baseDate, this.#scale);
    }

    async setScale(scale) {
        if (this.#scale === scale) return;
        this.#scale = scale;
        if (this.#data != null) {
            this.#setYOffset();
            await this.clean();
            await this.draw();
        }
    }

    #setYOffset() {
        if (this.#canvas == null) return;
        this.#canvas.y_offset = this.#canvas.__offsets.get("y", this.#scale !== TIMELINE_SCALE.YEAR ? "default_selection" : "year_selection");
    }

    async draw() {
        await this.#rowManager.redraw(this.#data.length, this.#scale, this.#canvas);
        await this.#headerManager.createHeaders(this.#baseDate, this.#scale, this.#canvas);
        await this.#selectionManager.hide();

        this.#canvas.__camera.position.x = this.#canvas.__camera.offset_x;
    }

    async clean() {
        const scene = this.#canvas.__layers[0];
        for (const item of this.#data) {
            delete item.actual_geom;
        }
        await this.#rowManager.clean(this.#canvas, scene);
        await this.#headerManager.removeHeaders();
    }

    async update(index, item) {
        const position = this.data[index].__position;
        await this.#rowManager.redrawAtPosition(position, index,item,this.#canvas);
    }
}

customElements.define("crs-timeline", Timeline)
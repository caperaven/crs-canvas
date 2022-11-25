import "./../canvas_2d/canvas_2d.js";
import "./managers/row-manager.js"
import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";

import {configureCamera, jumpToDate} from "./timeline-camera.js";
import "./../../src/factory/timeline-shape-factory.js"
import {VirtualizationHeaderManager} from "./managers/headers/virtualization-header-manager.js";
import {RowManager} from "./managers/row-manager.js";
import {SelectionManager} from "./managers/selection-manager.js";
import {TIMELINE_SCALE} from "./timeline-scale.js";
import {createBaseDashedLine, createRect} from "./timeline-helpers.js";

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
        offsetTextRow: -0.00061,
        selectionMesh: -0.0001,
    });

    #offsets = Object.freeze({
        y: {
            default_header: 1,
            year_header: 0.5,
            default_row: 1.25,
            year_row: 0.75,
            default_offset_row: 1.6,
            year_offset_row: 2.15,
            default_offset_row_bg: 1.5,
            year_offset_row_bg: 1,
            default_text_offset_row_bg: 0.38,
            year_text_offset_row_bg: 0.38,
            default_selection: 0.25,
            year_selection: -0.5
        }
    });

    #selectedItem;
    #selectedIndex;

    #rowSize = 1.25
    #todayLineMesh;

    static get observedAttributes() {
        return ["data-scale"];
    }

    get baseDate() {
        return this.#baseDate;
    }

    get scale() {
        return this.#scale;
    }

    get canvas() {
        return this.#canvas;
    }

    async connectedCallback() {
        this.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());
        this.#configuration = await fetch(this.dataset.config).then(result => result.json());
        this.#scale = this.dataset.scale || 'month';

        requestAnimationFrame(async () => {
            this.#canvas = this.querySelector("canvas") || this.canvas;
            this.#canvas.__zIndices = this.#zIndices;
            this.#canvas.__offsets = this.#offsets;
            this.#canvas.__rowSize = this.#rowSize;

            const ready = async () => {
                this.#canvas.removeEventListener("ready", ready);
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
        this.#baseDate = null;
        this.#configuration = null;
        this.#data = null;
        this.#scale = null;
        this.#todayLineMesh = this.#todayLineMesh.dispose();
        this.#canvas = null;
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-scale") {
            await this.setScale(newValue);
        }
    }

    async #init() {
        await crs.call("gfx_theme", "set", {
            element: this.#canvas,
            theme: this.#configuration.theme
        });

        this.#baseDate = new Date(new Date().toDateString());

        await crs.call("gfx_timeline_manager", "initialize", {element: this.#canvas, base: this.#baseDate, scale: this.#scale});
        await crs.call("gfx_text", "initialize", {element: this.#canvas});
        await crs.call("gfx_icons", "initialize", {element: this.#canvas});

        this.#headerManager = new VirtualizationHeaderManager();
        this.#rowManager = new RowManager(this.#configuration);
        this.#canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        const scene = this.#canvas.__layers[0];
        const camera = this.#canvas.__camera;
        await configureCamera(camera, scene);
        this.#setYOffset();
        await this.#initSelection();
        await this.render(true);
    }

    async #initSelection() {
        this.#selectionManager = new SelectionManager(this.#canvas, async  (event, index) => {
            if(index < 0) return;

            let item = await crs.call("datasource", "get_by_index", {
                element: this,
                index: index
            });

            this.#selectedItem = item;
            this.#selectedIndex = index;
            this.dispatchEvent(new CustomEvent("selectedItemChange", {
                detail: {
                    item: this.#selectedItem,
                    index: this.#selectedIndex
                }
            }));
            return true;
        });
        this.#selectionManager.init(this.#canvas);
    }

    async #getData() {
        let items = await crs.call("datasource", "load", {
            element: this
        }); // We've created this temporary system, it will be changed to data manager in v2.
        return items;
    }

    async render(firstRender) {
        if(firstRender !== true) {
            await this.clean();
        }
        const items = await this.#getData();
        if (items == null || items.length === 0) return;

        const scene = this.#canvas.__layers[0];

        await this.#headerManager.createHeaders(this.#baseDate, this.#scale, this.#canvas);
        await this.#rowManager.render(items, this.#canvas, scene, this.#baseDate, this.#scale);

        this.#todayLineMesh = await createBaseDashedLine(this.#canvas.__camera,scene , this.#scale, this.#canvas);
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
        this.#canvas.y_offset = this.#scale !== TIMELINE_SCALE.YEAR ? 1 : 0.5;

        createRect("test", "#ff0000", 1,-1,-0.01,0.1, 0.1, this.#canvas)
    }

    // async draw() {
    //     await this.#rowManager.redraw(this.#data.length, this.#scale, this.#canvas);
    //     await this.#headerManager.createHeaders(this.#baseDate, this.#scale, this.#canvas);
    //     await this.#selectionManager.hide();
    //     this.#todayLineMesh = await createBaseDashedLine(this.#canvas.__camera, this.#canvas.__layers[0], this.#scale, this.#canvas);
    //     this.#canvas.__camera.position.x = this.#canvas.__camera.offset_x;
    // }

    async clean() {
        const scene = this.#canvas.__layers[0];

        await this.#rowManager.clear(this.#canvas, scene);
        await this.#headerManager.removeHeaders();
        this.#todayLineMesh.dispose();
    }

    async update(index, item) {
        const position = this.#data[index].__position;
        await this.#rowManager.redrawRowAtPosition(position, index,item,this.#canvas);
    }

    async jumpToDate(date) {
        if (date == null) return;
        await jumpToDate(this.#canvas, this.#baseDate, date, this.#scale);
    }
}

customElements.define("crs-timeline", Timeline)
import "./../canvas_2d/canvas_2d.js";
import "./managers/row-manager.js"
import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";

import {configureCamera, jumpToDate, updateCameraLimits} from "./timeline-camera.js";
import "./../../src/factory/timeline-shape-factory.js"
import {VirtualizationHeaderManager} from "./managers/headers/virtualization-header-manager.js";
import {RowManager} from "./managers/row-manager.js";
import {SelectionManager} from "./managers/selection-manager.js";
import {TIMELINE_SCALE} from "./timeline-scale.js";
import {createBaseDashedLine, createRect} from "./timeline-helpers.js";

export class Timeline extends HTMLElement {
    #canvas;
    #scale;
    #baseDate;
    #headerManager;
    #rowManager;
    #selectionManager;
    #resizeTimeout = null;
    #loader = null;
    #intialized = null;
    #wheelHandler = this.#mouseWheel.bind(this);
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

    get baseDate() {
        return this.#baseDate;
    }

    get scale() {
        return this.#scale;
    }

    get canvas() {
        return this.#canvas;
    }

    get selectedItem() {
        return this.#selectedItem;
    }

    set selectedItem(newValue) {
        this.#selectedItem = newValue;
    }

    get selectedIndex() {
        return this.#selectedIndex;
    }

    set selectedIndex(newValue) {
        this.#selectedIndex = newValue;
    }

    async connectedCallback() {

        this.innerHTML = await fetch(import.meta.url.replace(".js", ".html")).then(result => result.text());

        this.#scale = this.dataset.scale || 'month';

        this.addEventListener("wheel", this.#wheelHandler);



        requestAnimationFrame(async () => {
            this.#canvas = this.querySelector("canvas") || this.canvas;
            this.#canvas.__zIndices = this.#zIndices;
            this.#canvas.__offsets = this.#offsets;
            this.#canvas.__rowSize = this.#rowSize;

            const ready = async () => {
                this.#canvas.removeEventListener("ready", ready);
                this.#canvas.__engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
                this.#canvas.__engine.adaptToDeviceRatio = false;

                await crs.call("dom_observer", "observe_resize", {
                    element: this,
                    callback: (value)=> {
                       if(this.#intialized) {
                           this.#toggleResizeLoader();
                       }
                       else {
                           this.#intialized = true;
                       }
                    }
                })

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
        await crs.call("dom_observer", "unobserve_resize", {element: this});
        this.removeEventListener("wheel", this.#wheelHandler);
        this.#wheelHandler = null;
        this.#headerManager = this.#headerManager.dispose(this.#canvas);
        this.#rowManager = this.#rowManager.dispose(this.#canvas);
        this.#baseDate = null;
        this.#scale = null;
        this.#todayLineMesh = this.#todayLineMesh.dispose();
        this.#canvas = null;
    }

    #toggleResizeLoader() {
        if (this.#loader == null) {
            this.#loader = document.createElement("div");
            this.#loader.id = "loader";
            this.appendChild(this.#loader);
        }
        clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(async () => {

            await this.resize();
            this.#resizeTimeout = null;
            setTimeout(() => {
                this.#loader = this.#loader.remove();
            }, 250);
        }, 200);
    }

    async setScale(newValue) {
        if (this.#scale === newValue) return;
        const previousScale = this.#scale;
        this.#scale = newValue;

        await this.render();
        await this.#scrollToDate(previousScale)
    }

    async adjustZoom(zoomValue) {
        this.#canvas.__camera.position.z += zoomValue;
        this.#canvas.__camera.maxZ = this.#canvas.__camera.position.z;
        this.#canvas.__camera.offset_y += (zoomValue / 2.4);
        this.#canvas.__camera.position.y += (zoomValue / 2.4);
    }

    async #scrollToDate(scale) {
        const currentX = this.#canvas.__camera.position.x;
        const date = await crs.call("gfx_timeline_manager", "get_date_at_x", {
            element: this.#canvas,
            scale: scale,
            x: currentX
        });
        await crs.call("gfx_timeline", "jump_to_date", {
            element: this.#canvas,
            base: this.#baseDate,
            date: date,
            scale: this.#scale
        });
    }

    async init() {
        this.#baseDate = new Date(new Date().toDateString());

        await crs.call("gfx_timeline_manager", "initialize", {
            element: this.#canvas,
            base: this.#baseDate,
            scale: this.#scale
        });
        await crs.call("gfx_text", "initialize", {element: this.#canvas});
        await crs.call("gfx_icons", "initialize", {element: this.#canvas});

        this.#headerManager = new VirtualizationHeaderManager();

        this.#canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        await configureCamera(this.#canvas);

        await this.#initSelection();
    }

    setRowConfig(config) {
        if (this.#rowManager != null) {
            this.#rowManager.dispose(this.#canvas);
        }
        this.#rowManager = new RowManager(config);
    }

    async #initSelection() {
        this.#selectionManager = new SelectionManager(this.#canvas, async (index) => {
            if (index < 0) return;

            let item = await crs.call("timeline_datasource", "get_by_index", {
                element: this,
                index: index
            });

            this.selectedItem = item;
            this.selectedIndex = index;
            this.dispatchEvent(new CustomEvent("selectedItemChange", {
                detail: {
                    item: this.selectedItem,
                    index: this.selectedIndex
                }
            }));
            return true;
        });
        await this.#selectionManager.init(this.#canvas);
    }

    async #getData() {
        let items = await crs.call("timeline_datasource", "load", {
            element: this,
            perspective: this.dataset.perspective
        }); // We've created this temporary system, it will be changed to data manager in v2.
        return items;
    }

    async render(firstRender) {
        if (firstRender !== true) {
            await this.clean();
        }
        this.#setYOffset();

        const items = await this.#getData();
        if (items == null || items.length === 0) return;

        this.#canvas.__rowCount = items.length;

        this.#selectionManager.moveSelectionToIndex(this.selectedIndex || 0);
        const scene = this.#canvas.__layers[0];

        await this.#headerManager.createHeaders(this.#baseDate, this.#scale, this.#canvas);
        await this.#rowManager.render(items, this.#canvas, scene, this.#baseDate, this.#scale);

        this.#todayLineMesh = await createBaseDashedLine(this.#canvas.__camera, scene, this.#scale, this.#canvas);
        this.#setCameraYLimits();
    }

    #setCameraYLimits() {
        // We get the max camera value using row size and count, then subtract the offset
        const value = -this.#canvas.y_offset + ((this.#canvas.__rowSize * this.#canvas.__rowCount) / -1) - this.#canvas.__camera.offset_y;
        this.#canvas.__camera.__maxYCamera = value < this.#canvas.__camera.offset_y ? value : this.#canvas.__camera.offset_y;
    }

    #setYOffset() {
        this.#canvas.y_offset = this.#scale !== TIMELINE_SCALE.YEAR ? 1 : 0.5;
    }

    #mouseWheel(event) {
        event.preventDefault();
    }

    async clean() {
        const scene = this.#canvas.__layers[0];

        await this.#rowManager.clear(this.#canvas, scene);
        await this.#headerManager.removeHeaders();
        this.#todayLineMesh.dispose();
    }

    async update(index, item) {
        await this.#rowManager.redrawRowAtIndex(index, item, this.#canvas);
    }

    async jumpToDate(date) {
        if (date == null) return;
        await jumpToDate(this.#canvas, this.#baseDate, date, this.#scale);
    }

    async resize() {
        const camera = await this.#canvas.__camera;
        camera.position.x = 0;
        camera.position.y = 0;
        await this.#canvas.__resize();
        requestAnimationFrame(async ()=> {
            await updateCameraLimits(camera, this.#canvas.__layers[0]);
        })
    }
}

customElements.define("crs-timeline", Timeline)
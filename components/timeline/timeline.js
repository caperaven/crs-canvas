import "./../canvas_2d/canvas_2d.js";
import {ThemeManager} from "./managers/theme-manager.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"

import "./../../src/managers/mesh-factory-manager.js";
import "./managers/timeline-manager.js";
import {workOrderSamples} from "./sample_data.js"; //TODO KR: revert when done

import {TIMELINE_SCALE} from "./timeline_scale.js";

export class Timeline extends crsbinding.classes.BindableElement {

    #canvas;
    #baseDate;
    #data;

    get html() {
        return import.meta.url.replace(".js", ".html")
    }

    get scale() {
        return this.getProperty('scale');
    }

    set scale(scale) {
        this.setProperty('scale', scale);
    }

    get configuration() {
        return this.getProperty('configuration');
    }

    set configuration(configuration) {
        this.setProperty('configuration', configuration);
    }


    get data() {
        return this.#data;
    }

    set data(newValue) {
        this.setData(newValue);
    }

    async setData(data) {
        if(this.#baseDate == null) {
            await this.init();
        }
        if(this.#data != null) {
            await this.clean();
        }
        this.#data = data;
        await this.render();
    }

    static get observedAttributes() {
        return ["view"];
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.configuration = {
            shapes: [
                {
                    shapeType: "rect",
                    fromField: "workStartedOn",
                    toField: "completedOn"
                },
                {
                    shapeType: "range_indicator",
                    fromField: "startOn",
                    toField: "completeBy"
                },
                {
                    shapeType: "pillar",
                    fromField: "receivedOn",
                    toField: "requiredBy"
                }
            ]
        }

        this.#canvas = this.querySelector("canvas") || this.canvas;
        this.scale = this.scale || 'month';

        await ThemeManager.initialize(this.#canvas);
        const ready = async () => {
            this.#canvas.removeEventListener("ready", ready);
            this.#canvas.__engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

            this.#data = workOrderSamples;  //TODO KR: revert when done
            await this.init()
            // if(this.#data) {
            //     await this.render();
            // }
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

    async attributeChangedCallback(name, oldValue, newValue) {
        await this.setScale(newValue);
    }

    async init() {
        if (this.#baseDate == null) this.#baseDate = new Date(new Date().toDateString());

        await crs.call("gfx_timeline_manager", "initialize", {
            element: this.#canvas,
            base: this.#baseDate,
            scale: this.scale
        });

        await crs.call("gfx_timeline_header", "initialize", {element: this.#canvas});

        await crs.call("gfx_timeline_rows", "initialize", {element: this.#canvas, config: this.configuration});

        const scene = this.#canvas.__layers[0];
        const camera = this.#canvas.__camera;
        await this.#configureCamera(camera, scene);
        await this.render()
    }

    async render() {
        if(this.#data == null || this.#data.length === 0) return;

        await crs.call("gfx_timeline_header", "render", {
            element: this.#canvas,
            base_date: this.#baseDate,
            scale: this.scale
        });

        await crs.call("gfx_timeline_rows", "render", {
            element: this.#canvas,
            items: this.#data,
            base_date: this.#baseDate,
            scale: this.scale,
            forceRender: true
        });

    }

    async #configureCamera(camera, scene) {
        let observer = scene.onBeforeRenderObservable.add(() => {
            camera.getViewMatrix();

            const topLeftNormalised = new BABYLON.Vector3(-1, 1, 1)

            // Calculate top_left corner on the far plane. We need it to calculate our tangent
            const pos = BABYLON.Vector3.TransformCoordinates(topLeftNormalised, camera.getTransformationMatrix().invert());

            if (pos.x) {
                camera._transformed = true;

                const zDistance = pos.z - camera.position.z;
                const tangentX = this.#calculateTangent(zDistance, pos.x);
                const cameraNewX = tangentX * camera.position.z;

                const tangentY = this.#calculateTangent(zDistance, pos.y);
                const cameraNewY = tangentY * camera.position.z;

                camera.offset_x = cameraNewX;
                camera.view_width = cameraNewX * 2;
                camera.offset_y = cameraNewY;
                camera.view_height = cameraNewY * 2 / -1;

                camera.position.x = cameraNewX;
                camera.position.y = cameraNewY;

                scene.onBeforeRenderObservable.remove(observer)
            }
        })
    }

    #calculateTangent(adjacent, opposite) {
        return opposite / adjacent;
    }

    async setScale(scale) {
        if (this.scale == scale) return;
        if (this.#canvas == null || this.#canvas.__headers == null || this.#canvas.__rows == null) return;
        this.scale = scale;
        await this.clean();
      await  this.render();

    }

    async clean() {
        await crs.call("gfx_timeline_header", "clean", {element: this.#canvas});
        await crs.call("gfx_timeline_rows", "clean", {element: this.#canvas});
    }
}

customElements.define("crs-timeline", Timeline)
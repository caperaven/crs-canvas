import {ThemeManager} from "./managers/theme-manager.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"

import "./../../src/managers/mesh-factory-manager.js";
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
        this.scale = this.scale || 'year';

        await ThemeManager.initialize(this.#canvas);
        const ready = async () => {
            this.#canvas.removeEventListener("ready", ready);
            this.#canvas.__engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
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
        const scene = this.#canvas.__layers[0];
        const camera = this.#canvas.__camera;

        this.#canvas.__camera.checkCollisions = true;
        scene.collisionsEnabled = true;
        camera.collisionRadius = new BABYLON.Vector3(1, 1, 1);


        const startDate = new Date(2021, 8, 1);
        const endDate = new Date(2024, 11, 31);

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
        await this.#configureCamera(camera, scene);
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
                camera.offset_y = cameraNewY;

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
        this.scale = scale;
        //TODO KR: add refresh logic
    }
}

customElements.define("crs-timeline", Timeline)
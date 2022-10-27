import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {HeaderMeshManager} from "./header-mesh-manager.js";
import {createRect} from "./timeline-helpers.js";

class VirtualizationHeaderManager {

    #virtualization;
    #meshStore;
    #bgBorderMesh;

    constructor() {
    }

    dispose() {
        this.#virtualization = this.#virtualization.dispose();
    }

    async clean(canvas, scene) {

    }

    async render(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;
        await this.addTempDot(canvas);


        this.#meshStore = {};

        canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: baseDate,
            scale: scale
        });

        let headerManager = new HeaderMeshManager();

        const add = async (position, index) => {
            return await headerManager.create(scale, position, index, baseDate, canvas);
        }

        const remove = async (instance) => {
            return await headerManager.remove(scale, instance);
        }

        scene.onBeforeRenderObservable.addOnce(async () => {
            this.#virtualization = new StaticVirtualization(rangeProperties.width, canvas.__camera.view_width, add, remove);
            this.#bgBorderMesh = await createRect("header_bg", canvas._theme.header_border, canvas.__camera.offset_x, -0.5, 9999999, 1, canvas);
            this.#virtualization.draw(canvas.__camera.position.x - canvas.__camera.offset_x);
        });

        canvas.__camera.onViewMatrixChangedObservable.add(async (camera) => {
            await this.#virtualization.draw(camera.position.x - camera.offset_x);
            this.#bgBorderMesh.position.x &&= camera.position.x;
        });
    }

    async addTempDot(canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {width: 0.01, height: 20},
            },
            material: {
                id: "my_color",
                color: "#ff0000"
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        return meshes[0];
    }
}

export class VirtualizationHeaderManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__vheaders = new VirtualizationHeaderManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__headers = canvas.__headers?.dispose();
    }

    static async render(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const baseDate = await crs.process.getValue(step.args.base_date, context, process, item);

        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        canvas.__vheaders.render(baseDate, scale, canvas, scene);
    }

    static async clean(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        await canvas.__vheaders.clean(canvas, scene);
    }
}


crs.intent.gfx_timeline_virtual_header = VirtualizationHeaderManagerActions;
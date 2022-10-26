import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {createHeaderText} from "./header-managers/header-manager-utils.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {HeaderMeshManager} from "./header-mesh-manager.js";

class VirtualizationHeaderManager {

    #virtualization;

    constructor() {
    }

    dispose() {
        this.#virtualization = this.#virtualization.dispose();
    }

    async clean(canvas, scene) {

    }

    async render(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;
        await this.addTempDot(canvas)

        canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: baseDate,
            scale: scale
        });


        const add = async (position, index) => {

            const date = new Date(baseDate.getTime());
            date.setDate(date.getDate()+index);

           return await HeaderMeshManager.create(scale, position, index, baseDate, canvas);
        }

        const remove = async (instance) => {
            return await HeaderMeshManager.remove(scale, instance);
        }



        // this.#virtualization = new StaticVirtualization(rangeProperties.width, 20,add, remove);


        scene.onBeforeRenderObservable.addOnce(()=> {
            this.#virtualization =  new StaticVirtualization(rangeProperties.width, canvas.__camera.view_width,add, remove);
        });

        canvas.__camera.onViewMatrixChangedObservable.add((camera) => {
            this.#virtualization.draw(camera.position.x - camera.offset_x);
        });
    }




    async #drawRect(x, canvas, size) {

        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {width: size - 0.05, height: 0.5},
            },
            material: {
                id: "test",
                color: "#dddddd"
            },
            positions: [{x: x+0.5 , y: -0.5, z: 0}]
        })

        return meshes[0];
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
            positions: [{x: 0 , y: 0, z: 0}]
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
import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {createHeaderText} from "./header-managers/header-manager-utils.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TIMELINE_SCALE} from "../timeline_scale.js";

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
        const monMesh = await createHeaderText("Mon", canvas);
        const tueMesh = await createHeaderText("Tue", canvas);
        const wedMesh = await createHeaderText("Wed", canvas);
        const thuMesh = await createHeaderText("Thu", canvas);
        const friMesh = await createHeaderText("Fri", canvas);
        const satMesh = await createHeaderText("Sat", canvas);
        const sunMesh = await createHeaderText("Sun", canvas);




        const add = (position) => {
            return this.#drawRect(position, canvas, scale);
        }

        const remove = (instance) => {
            instance.dispose();
        }

        this.#virtualization = new StaticVirtualization(scale, 20,add, remove);


        canvas.__camera.onViewMatrixChangedObservable.add((camera) => {
            this.#virtualization.draw(camera.position.x);
        });
    }




    async #drawRect(x, canvas, size) {

        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {width: size - 0.05, height: 1},
            },
            material: {
                id: "my_color",
                color: "#ff0090"
            },
            positions: [{x: x + 1, y: -0.5, z: 0}]
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
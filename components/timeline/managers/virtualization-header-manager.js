import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {HeaderParticleManager} from "./header-particle-manager.js";
import {createRect} from "./timeline-helpers.js";

export class VirtualizationHeaderManager {

    #virtualization;
    #bgBorderMesh;

    constructor() {
    }

    dispose() {
        this.#bgBorderMesh = this.#bgBorderMesh.dispose();
        this.#virtualization = this.#virtualization.dispose();
    }

    async render(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;
        await this.addTempDot(canvas);

        canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: baseDate,
            scale: scale
        });

        let headerManager = new HeaderParticleManager();
        await headerManager.initialize(scale, rangeProperties.width, baseDate, canvas);

        const add = async (position, index) => {
            headerManager.render(index, position);
            return {};
            // return await headerManager.create(scale, position, index, baseDate, canvas);
        }

        const remove = async (instance) => {
            return true;
            // return await headerManager.remove(scale, instance);
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
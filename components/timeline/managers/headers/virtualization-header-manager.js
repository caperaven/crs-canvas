import "../../../../src/managers/mesh-factory-manager.js";
import "../../../../src/managers/particle-manager.js";
import "../../../../src/managers/text-manager.js";
import {StaticVirtualization} from "../static-virtualization.js";
import {TIMELINE_SCALE} from "../../timeline-scale.js";
import {HeaderParticleManager} from "./header-particle-manager.js";
import {createRect} from "../timeline-helpers.js";
import {YearHeader} from "./year-header.js";

export class VirtualizationHeaderManager {

    #virtualization;
    #bgBorderMesh;
    #yearHeader;

    dispose() {
        this.#bgBorderMesh = this.#bgBorderMesh.dispose();
        this.#virtualization = this.#virtualization.dispose();
        this.#yearHeader = this.#yearHeader.dispose();
    }

    async init(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;
        await this.addTempDot(canvas);

        canvas._text_scale = new BABYLON.Vector3(0.3, 0.3, 1);

        const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: baseDate,
            scale: scale
        });

        const headerManager = new HeaderParticleManager();
        await headerManager.initialize(scale, baseDate, canvas);

        this.#yearHeader = new YearHeader();


        const add = async (position, index) => {
            await headerManager.render(index, position);
            return 1;
        }

        const remove = async () => {
            return 1;
        }

        scene.onBeforeRenderObservable.addOnce(async () => {
            const position = canvas.__camera.position.x - canvas.__camera.offset_x;

            await this.#yearHeader.init(baseDate, scale, canvas);

            this.#virtualization = new StaticVirtualization(rangeProperties.width, canvas.__camera.view_width, add, remove);

            this.#bgBorderMesh = await createRect("header_bg", canvas._theme.header_offset_bg, canvas.__camera.offset_x, -0.51, 9999999, 1.02, canvas);
            await this.#virtualization.draw(position);
            await this.#yearHeader.draw(position)
        });

        canvas.__camera.onViewMatrixChangedObservable.add(async (camera) => {
            const position = camera.position.x - camera.offset_x;
            await this.#virtualization.draw(position);
            await this.#yearHeader.draw(position)
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

import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {HeaderParticleManager} from "./header-particle-manager.js";
import {createRect} from "./timeline-helpers.js";
import {DynamicVirtualization} from "./dynamic-virtualization.js";

export class VirtualizationHeaderManager {

    #virtualization;
    #yearVirtualization;
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

        const headerManager = new HeaderParticleManager();
        await headerManager.initialize(scale, rangeProperties.width, baseDate, canvas);

        const yearHeaderManager = new HeaderParticleManager();
        await yearHeaderManager.initialize("year", rangeProperties.width, baseDate, canvas);


        const add = async (position, index) => {
            headerManager.render(index, position);
            return 1;
            // return await headerManager.create(scale, position, index, baseDate, canvas);
        }

        const remove = async (instance) => {
            return 1;
            // return await headerManager.remove(scale, instance);
        }

        const addYear = async (position, index) => {
            yearHeaderManager.render(index, position);
            return  1;
        }

        const removeYear = async (instance) => {
            return 1;
        }

        let items = await this.#getMonths(baseDate, canvas, scale);

        console.log(items);

        scene.onBeforeRenderObservable.addOnce(async () => {
            this.#virtualization = new StaticVirtualization(rangeProperties.width, canvas.__camera.view_width, add, remove);
            this.#yearVirtualization = new DynamicVirtualization(items, canvas.__camera.view_width, addYear, removeYear);
            this.#bgBorderMesh = await createRect("header_bg", canvas._theme.header_offset_bg, canvas.__camera.offset_x, -0.5, 9999999, 1, canvas);
            this.#virtualization.draw(canvas.__camera.position.x - canvas.__camera.offset_x);
            this.#yearVirtualization.draw(canvas.__camera.position.x - canvas.__camera.offset_x);
        });

        canvas.__camera.onViewMatrixChangedObservable.add(async (camera) => {
            await this.#virtualization.draw(camera.position.x - camera.offset_x);

            await this.#yearVirtualization.draw(camera.position.x - camera.offset_x);


            // this.#bgBorderMesh.position.x &&= camera.position.x;
        });
    }

    async #getMonths(baseDate, canvas, scale) {
         const date = new Date(baseDate.getTime());
        date.setDate(1);

        let items = []
        const positiveDate = new Date(date.setMonth(date.getMonth()));
        const negativeDate = new Date(date.setMonth(date.getMonth()));

        const days = daysInMonth(negativeDate.getMonth() +1,negativeDate.getFullYear());
        const factor = YearFactor[scale];
        const baseMonthProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: new Date(negativeDate.getTime()),
            scale: "year",
            relativeItemWidth:  days * factor
        });

        let offset = baseMonthProperties.width / days * baseDate.getDate()

        let position = -offset;

        function daysInMonth (month, year) {
            return new Date(year, month, 0).getDate();
        }

        for (let i = 0; i > -240; i--) {
            const days = daysInMonth(negativeDate.getMonth() +1,negativeDate.getFullYear());
            const factor = YearFactor[scale];

            const monthProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: new Date(negativeDate.getTime()),
                scale: "year",
                relativeItemWidth:  days * factor
            });



            negativeDate.setMonth(negativeDate.getMonth() - 1)
            items.push({position: position, size: monthProperties.width, date: new Date(negativeDate), index: i});
            position -= monthProperties.width;
        }

        position = -offset;
        items.reverse();

        for (let i = 0; i < 240; i++) {

            const days = daysInMonth(positiveDate.getMonth() +1,positiveDate.getFullYear());
            const factor = YearFactor[scale];

            const monthProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: new Date(positiveDate.getTime()),
                scale: "year",
                relativeItemWidth:  days * factor
            });



            positiveDate.setMonth(positiveDate.getMonth() + 1)
            items.push({position: position, size: monthProperties.width, date: new Date(positiveDate), index: i});
            position += monthProperties.width;
        }

        return items;

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

const YearFactor = Object.freeze({
    "day":   48,
    "week":  4,
    "month": 1,
})
import {HeaderParticleManager} from "./header-particle-manager.js";
import {DynamicVirtualization} from "../dynamic-virtualization.js";
import {StaticVirtualization} from "../static-virtualization.js";
import {TIMELINE_SCALE} from "../../timeline-scale.js";

export class ParticleHeader {
    #virtualization;
    #headerParticleManager;

    dispose() {
        this.#virtualization = this.#virtualization.dispose();
        this.#headerParticleManager = this.#headerParticleManager.dispose();
    }

    async init(baseDate, scale, canvas, relativeScale) {
        this.#headerParticleManager = new HeaderParticleManager();
        await this.#headerParticleManager.initialize(scale, baseDate, canvas);

        // TODO GM Convention over code here
        if (scale === TIMELINE_SCALE.YEAR) {
            this.#virtualization = await createYearVirtualization(this.#headerParticleManager, baseDate, canvas, relativeScale);
        } else if (scale === "day-month") {
            const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: baseDate,
                scale: relativeScale
            });

            this.#virtualization = await createStaticVirtualization(this.#headerParticleManager, rangeProperties.width * 48, baseDate, canvas);
        } else {
            const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: baseDate,
                scale: scale
            });

            this.#virtualization = await createStaticVirtualization(this.#headerParticleManager, rangeProperties.width, baseDate, canvas);
        }
        await this.draw(0);
    }

    async draw(position) {
        await this.#virtualization.draw(position);
    }
}

async function createStaticVirtualization(manager, size, baseDate, canvas) {

    const add = async (position, index) => {
        await manager.render(index, position);
        return 1;
    }

    const remove = async () => {
        return 1;
    }

    return new StaticVirtualization(size, canvas.__camera.view_width, add, remove);
}

async function createYearVirtualization(manager, baseDate, canvas, relativeScale) {

    const add = async (position, index) => {
        await manager.render(index, position);
        return 1;
    }

    const remove = async () => {
        return 1;
    }
    const yearHelperModule = await import("./year-helpers.js");

    let items = await yearHelperModule.default(baseDate, canvas, relativeScale);

    return new DynamicVirtualization(items, canvas.__camera.view_width, add, remove);
}



import {HeaderParticleManager} from "../header-particle-manager.js";
import {DynamicVirtualization} from "../dynamic-virtualization.js";

export class YearHeader {
    #virtualization;
    #headerParticleManager;

    dispose() {
        this.#virtualization = this.#virtualization.dispose();
        this.#headerParticleManager = this.#headerParticleManager.dispose();
    }

    async init(baseDate, relativeScale, canvas) {

        this.#headerParticleManager = new HeaderParticleManager();
        await this.#headerParticleManager.initialize("year", baseDate, canvas);

        const addYear = async (position, index) => {
            await this.#headerParticleManager.render(index, position);
            return 1;
        }

        const removeYear = async () => {
            return 1;
        }

        let items = await this.#getMonths(baseDate, canvas, relativeScale);
        this.#virtualization = new DynamicVirtualization(items, canvas.__camera.view_width, addYear, removeYear);
    }

    async draw(position) {
        await this.#virtualization.draw(position);
    }

    async #getMonths(baseDate, canvas, scale) {
        const date = new Date(baseDate.getTime());
        date.setDate(1);

        let items = []
        const positiveDate = new Date(date.setMonth(date.getMonth()));
        const negativeDate = new Date(date.setMonth(date.getMonth()));

        const days = daysInMonth(negativeDate.getMonth() + 1, negativeDate.getFullYear());
        const factor = YearFactor[scale];
        const baseMonthProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            base: new Date(negativeDate.getTime()),
            scale: "year",
            relativeItemWidth: days * factor
        });

        let offset = baseMonthProperties.width / days * baseDate.getDate()

        let position = -offset;

        function daysInMonth(month, year) {
            return new Date(year, month, 0).getDate();
        }

        for (let i = 0; i > -240; i--) {
            const days = daysInMonth(negativeDate.getMonth() + 1, negativeDate.getFullYear());
            const factor = YearFactor[scale];

            const monthProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: new Date(negativeDate.getTime()),
                scale: "year",
                relativeItemWidth: days * factor
            });


            negativeDate.setMonth(negativeDate.getMonth() - 1)
            items.push({position: position, size: monthProperties.width, date: new Date(negativeDate), index: i});
            position -= monthProperties.width;
        }

        position = -offset;
        items.reverse();

        for (let i = 0; i < 240; i++) {

            const days = daysInMonth(positiveDate.getMonth() + 1, positiveDate.getFullYear());
            const factor = YearFactor[scale];

            const monthProperties = await crs.call("gfx_timeline_manager", "set_range", {
                element: canvas,
                base: new Date(positiveDate.getTime()),
                scale: "year",
                relativeItemWidth: days * factor
            });


            positiveDate.setMonth(positiveDate.getMonth() + 1)
            items.push({position: position, size: monthProperties.width, date: new Date(positiveDate), index: i});
            position += monthProperties.width;
        }

        return items;

    }
}


const YearFactor = Object.freeze({
    "day": 48,
    "week": 4,
    "month": 1,
})
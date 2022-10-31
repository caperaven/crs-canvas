import {HeaderParticleManager} from "./header-particle-manager.js";
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
O
    async draw(position) {
        await this.#virtualization.draw(position);
    }

    async #getMonths(baseDate, canvas, scale) {
        //date, index, position, size for each data item
        const startingMonthDate = new Date(baseDate.getTime());
        startingMonthDate.setDate(1);

        let items = [];

        for (let i = -240; i < 240; i++) {
            const dateItem = new Date(startingMonthDate.getTime());
            dateItem.setMonth(dateItem.getMonth() + i);

            //calculate size
            const daysInMonth = this.#daysInMonth(dateItem.getMonth(), dateItem.getFullYear());
            const sizeOfMonth = daysInMonth * YearFactor[scale];

            //calculate position
            const result = await crs.call("gfx_timeline_manager", "get", {element: canvas, start: baseDate, end: dateItem, scale: scale});
            const position = result.x2;

            items.push({
                date: dateItem,
                index: i,
                position: position,
                size: sizeOfMonth
            })
        }

        return items;
    }

    #daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }
}


const YearFactor = Object.freeze({
    "day": 48,
    "week": 4,
    "month": 1,
})
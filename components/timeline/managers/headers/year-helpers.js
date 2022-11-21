import {TIMELINE_SCALE} from "../../timeline-scale.js";

export default async function getMonths(baseDate, canvas, scale) {
    //date, index, position, size for each data item
    const startingMonthDate = new Date(baseDate.getTime());
    startingMonthDate.setDate(1);

    let items = [];

    for (let i = -240; i < 240; i++) {
        const dateItem = new Date(startingMonthDate.getTime());
        dateItem.setMonth(dateItem.getMonth() + i);

        const nextDate = new Date(dateItem);
        nextDate.setMonth(nextDate.getMonth() + 1);

        const result = await crs.call("gfx_timeline_manager", "get", {
            element: canvas,
            start: dateItem,
            end: nextDate,
            scale: scale
        });

        items.push({
            date: dateItem,
            index: i,
            position: result.x2,
            size: result.width
        })
    }

    return items;
}

function calcDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const YearFactor = Object.freeze({
    "day": 48,
    "week": 4,
    "month": 1
})
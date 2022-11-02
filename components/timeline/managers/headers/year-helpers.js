import {TIMELINE_SCALE} from "../../timeline-scale.js";

export default async function getMonths(baseDate, canvas, scale) {
    //date, index, position, size for each data item
    const startingMonthDate = new Date(baseDate.getTime());
    startingMonthDate.setDate(1);

    let items = [];

    for (let i = -240; i < 240; i++) {
        const dateItem = new Date(startingMonthDate.getTime());
        dateItem.setMonth(dateItem.getMonth() + i);

        //calculate size
        const daysInMonth = calcDaysInMonth(dateItem.getMonth(), dateItem.getFullYear());
        let sizeOfMonth;
        if (scale === TIMELINE_SCALE.YEAR) {
            sizeOfMonth = (daysInMonth/ 31) * 4
        }
        else {
            sizeOfMonth = daysInMonth * YearFactor[scale];
        }

        //calculate position
        const result = await crs.call("gfx_timeline_manager", "get", {
            element: canvas,
            start: baseDate,
            end: dateItem,
            scale: scale
        });
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

function calcDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

const YearFactor = Object.freeze({
    "day": 48,
    "week": 4,
    "month": 1
})
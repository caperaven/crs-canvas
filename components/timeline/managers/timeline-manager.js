const ViewToScaleFactor = Object.freeze({
    "day":   2,
    "week":  3 / 24,
    "month": 1 / 24,
    "year":  3 / 730
})

function getDate(date) {
    if (typeof(date) === 'number') {
        return date;
    }

    if (date instanceof Date) {
        return date.getTime();
    }

    if (typeof(date) === 'string') {
        const parts = date.split(" ");
        const newDate = parts[0].split("/").reverse().join("-");
        const fullString = [newDate, parts[1]].join("T");
        return (new Date(Date.parse(fullString))).getTime();
    }
}

class DayScale {
    async get(min, date, zoomFactor = 0) {
        const valueHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return valueHours * (ViewToScaleFactor.day + zoomFactor);
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        return {items: Math.round(difference * (ViewToScaleFactor.day + zoomFactor)), width: (1 + zoomFactor)};
    }
}

class WeekScale {
    async get(min, date, zoomFactor = 0) {
        const valueHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return valueHours * (ViewToScaleFactor.week + zoomFactor);
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        const hoursPerDay = Math.round(difference * (ViewToScaleFactor.week + (zoomFactor/24)));
        return {items: hoursPerDay, width: (3 + (zoomFactor/24))};
    }
}

class MonthScale {
    async get(min, date, zoomFactor = 0) {
        const valueHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return valueHours * (ViewToScaleFactor.month + (zoomFactor/24));
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        return {items: Math.round(difference * (ViewToScaleFactor.month + (zoomFactor/24))), width: (1 + (zoomFactor/24))};
    }
}

class YearScale {
    //TODO KR: need to improve accuracy here
    async get(min, date, zoomFactor = 0) {
        const valueHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return valueHours * (ViewToScaleFactor.year + (zoomFactor/730));
    }

    async setScale(min, max, zoomFactor = 0) {
        console.log("getScale for years");
        //get times in date format
        const minDate = new Date(getDate(min));
        const maxDate = new Date(getDate(max));

        //get amount of months between those two dates
        const differenceInMonths = (maxDate.getMonth() - minDate.getMonth()) + (12 * (maxDate.getFullYear() - minDate.getFullYear()));
        const widths = [];
        let previousMonth = new Date(minDate);
        for (let i = 1; i < differenceInMonths; i++) {
            //loop through months calculating widths for each
            const newDate = new Date(previousMonth);
            newDate.setMonth(previousMonth.getMonth() + 1);
            const timeInHours = Math.abs(getDate(newDate) - getDate(previousMonth)) / 3.6e+6;
            const year = newDate.getFullYear();
            const isLeap = (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
            isLeap ? widths.push(timeInHours * (3/732)) : widths.push(timeInHours * (3/729.2));

            previousMonth = newDate;
        }

        return {items: differenceInMonths, widths: widths};

        // const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6; //difference in hours
        // const timeInDays = difference / 24;
        //
        // return {items: Math.round(timeInDays * (3 / 12)), width: (3 + (zoomFactor/12))} ;
    }
}

class TimelineManager {
    #min;
    #max;

    constructor(min, max) {
        this.#min = getDate(min);
        this.#max = getDate(max);
        this.setScales();
    }

    setScales() {
        this._dayScale   = this._dayScale   || new DayScale();
        this._weekScale  = this._weekScale  || new WeekScale();
        this._monthScale = this._monthScale || new MonthScale();
        this._yearScale  = this._yearScale  || new YearScale();
    }

    async setScale(canvas, min, max, scale) {
        if (this[`_${scale}Scale`] == null) this.setScales();
        if (scale != null) return await this[`_${scale}Scale`].setScale(getDate(min), getDate(max));
    }

    /**
     * Returns starting x & width of an item
     * @param start - Start Date
     * @param end - End Date
     * @param scale - day/week/month/year
     */
    async get(start, end, scale) {
        const x1 = await this[`_${scale}Scale`].get(getDate(this.#min), getDate(start));
        const x2 = await this[`_${scale}Scale`].get(getDate(this.#min), getDate(end));
        const width = Math.abs(x2 - x1);
        const x = x1 + (width / 2);
        // const x = x1 < x2 ? x1 + (width / 2) : x2 + (width / 2);        //Chat to GM on this detail
        return {
            x: x,
            width: width
        }
    }
}

class TimelineManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const min = (await crs.process.getValue(step.args.min, context, process, item));
        const max = (await crs.process.getValue(step.args.max, context, process, item));
        const scale = (await crs.process.getValue(step.args.scale, context, process, item));
        canvas.__timelineManager = new TimelineManager(min, max);
        return await canvas.__timelineManager.setScale(canvas, min, max, scale);
    }

    static async set_range(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const min = (await crs.process.getValue(step.args.min, context, process, item));
        const max = (await crs.process.getValue(step.args.max, context, process, item));
        const scale = (await crs.process.getValue(step.args.scale, context, process, item));
        return await canvas.__timelineManager.setScale(canvas, min, max, scale);
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const start = await crs.process.getValue(step.args.start, context, process, item);
        const end = await crs.process.getValue(step.args.end, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        return await canvas.__timelineManager.get(start, end, scale);
    }
}

crs.intent.gfx_timeline_manager = TimelineManagerActions;
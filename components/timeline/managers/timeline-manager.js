const ViewToScaleFactor = Object.freeze({
    "day":   2,
    "week":  4,
    "month": 1,
    "year":  3
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

        const newDate = parts[0].split("/").join("-");
        const fullString = [newDate, parts[1]].join("T");
        const result =  (new Date(Date.parse(fullString))).getTime();
        if(!result) {
            throw Error(`date: ${date}, full string: ${fullString} could not be converted.`);
        }
        return result;
    }
}

class DayScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * (ViewToScaleFactor.day + zoomFactor);
    }

    async setScale(base, zoomFactor = 0) {
        const width = (1 + zoomFactor);
        return {width: width};
    }
}

class WeekScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * ((ViewToScaleFactor.week / 24) + (zoomFactor / 24));
    }

    async setScale(base, zoomFactor = 0) {
        const width = (ViewToScaleFactor.week + (zoomFactor / 24));
        return {width: width};
    }
}

class MonthScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * ((ViewToScaleFactor.month / 24) + (zoomFactor / 24));
    }

    async setScale(base, zoomFactor = 0) {
        const width = (1 + (zoomFactor / 24));
        return {width: width};
    }
}

class YearScale {
    //returns the difference in year time between the two given months
    async get(min, date, zoomFactor = 0) {
        const minDate = new Date(getDate(min));
        const maxDate = new Date(getDate(date));

        const isLeap = this.#getLeap(minDate.getFullYear()) ? true: this.#getLeap(maxDate.getFullYear());
        return this.#getWidth(minDate, maxDate, 0, isLeap);
    }

    async setScale(base, relativeItemWidth) {
        let currentDate = new Date(base);

        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        currentDate.setMonth(currentDate.getMonth() + 1);
        const nextMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const isLeap = this.#getLeap(currentMonthStart.getFullYear()) ? true: this.#getLeap(nextMonthStart.getFullYear());
        const width = this.#getWidth(currentMonthStart, nextMonthStart, 0, isLeap, relativeItemWidth);

        return {width: width};
    }

    #getDifferenceInMonths(minDate, maxDate) {
        return (maxDate.getMonth() - minDate.getMonth()) + (12 * (maxDate.getFullYear() - minDate.getFullYear()));
    }

    #getLeap(year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    #getWidth(minDate, maxDate, zoomFactor, isLeap, relativeItemWidth) {
        const differenceInHours = (getDate(maxDate) - getDate(minDate)) / 3.6e+6;
        const leapFactor = isLeap ? 8784 / 12 : 8760 / 12;

        const factor = relativeItemWidth || ViewToScaleFactor.year;
        return  differenceInHours * ((factor/ leapFactor) + (zoomFactor / leapFactor));
    }
}


class TimelineManager {
    #baseDate;

    constructor(base) {
        this.#baseDate = getDate(base);
        this.setScales();
    }

    dispose() {
        this.#baseDate = null;
    }

    setScales() {
        //Note GM TODO KR we do not need to instantiate all these at start.

        this._dayScale   = this._dayScale   || new DayScale();
        this._weekScale  = this._weekScale  || new WeekScale();
        this._monthScale = this._monthScale || new MonthScale();
        this._yearScale  = this._yearScale  || new YearScale();
    }

    async setScale(canvas, base, scale, relativeItemWidth) {
        if (this[`_${scale}Scale`] == null) this.setScales();
        if (scale != null) return await this[`_${scale}Scale`].setScale(getDate(base), relativeItemWidth);
    }

    /**
     * Returns starting x & width of an item
     * @param start - Start Date
     * @param end - End Date
     * @param scale - day/week/month/year
     */
    async get(start, end, scale) {
        const x1 = await this[`_${scale}Scale`].get(getDate(this.#baseDate), getDate(start));
        const x2 = await this[`_${scale}Scale`].get(getDate(this.#baseDate), getDate(end));
        const width = Math.abs(x2 - x1);
        return {
            x1: x1,
            x2: x2,
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
        const base = (await crs.process.getValue(step.args.base, context, process, item));
        const scale = (await crs.process.getValue(step.args.scale, context, process, item));
        canvas.__timelineManager = new TimelineManager(base);
        return await canvas.__timelineManager.setScale(canvas, base, scale);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__timelineManager = canvas.__timelineManager?.dispose();
    }

    static async set_range(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const base = (await crs.process.getValue(step.args.base, context, process, item));
        const scale = (await crs.process.getValue(step.args.scale, context, process, item));
        const relativeItemWidth = (await crs.process.getValue(step.args.relativeItemWidth, context, process, item));
        return await canvas.__timelineManager.setScale(canvas, base, scale, relativeItemWidth);
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
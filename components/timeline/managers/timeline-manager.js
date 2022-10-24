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
    async get(min, date, zoomFactor = 0) {
        const minDate = new Date(getDate(min));
        const maxDate = new Date(getDate(date));

        //get amount of months between the two dates
        const differenceInMonths = this.#getDifferenceInMonths(minDate, maxDate);
        if (differenceInMonths === 0) {
            //Date occurs in the same month of the same year
            const isLeap = this.#getLeap(minDate.getFullYear());
            return this.#getWidth(minDate, maxDate, isLeap);
        } else {
            //Cycle through in-between months, building up totalWidth
            let previousDate = new Date(minDate);
            let totalWidth = 0;
            for (let i = 0; i < differenceInMonths; i++) {
                const newDate = new Date(previousDate);
                newDate.setMonth(previousDate.getMonth() + 1);

                const isLeap = this.#getLeap(newDate.getFullYear());
                const width = this.#getWidth(previousDate, newDate, isLeap);
                totalWidth += width;

                previousDate = newDate;
            }

            return totalWidth;
        }
    }

    async setScale(min, max, zoomFactor = 0) {
        const minDate = new Date(getDate(min));
        const maxDate = new Date(getDate(max));

        //get amount of months between the two dates
        const differenceInMonths = this.#getDifferenceInMonths(minDate, maxDate);
        const widths = [];
        let previousDate = new Date(minDate);
        let totalWidth = 0;
        for (let i = 0; i < differenceInMonths; i++) {
            //Cycle through the months between, adding individual month widths & totalWidth
            const newDate = new Date(previousDate);
            newDate.setMonth(previousDate.getMonth() + 1);

            const isLeap = this.#getLeap(newDate.getFullYear());
            const width = this.#getWidth(previousDate, newDate, isLeap);
            widths.push(width);
            totalWidth += width;

            previousDate = newDate;
        }

        return {items: differenceInMonths, width: widths, totalWidth: totalWidth};
    }

    #getDifferenceInMonths(minDate, maxDate) {
        return (maxDate.getMonth() - minDate.getMonth()) + (12 * (maxDate.getFullYear() - minDate.getFullYear()));
    }

    #getLeap(year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    #getWidth(minDate, maxDate, zoomFactor, isLeap) {
        const differenceInHours = Math.abs(getDate(maxDate) - getDate(minDate)) / 3.6e+6;
        return isLeap ? differenceInHours * ((ViewToScaleFactor.year / 732) + (zoomFactor / 732)) : differenceInHours * ((ViewToScaleFactor.year / 730) + (zoomFactor / 732));
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
        this._dayScale   = this._dayScale   || new DayScale();
        this._weekScale  = this._weekScale  || new WeekScale();
        this._monthScale = this._monthScale || new MonthScale();
        this._yearScale  = this._yearScale  || new YearScale();
    }

    async setScale(canvas, base, scale) {
        if (this[`_${scale}Scale`] == null) this.setScales();
        if (scale != null) return await this[`_${scale}Scale`].setScale(getDate(base));
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
        return await canvas.__timelineManager.setScale(canvas, base, scale);
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
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
        const newDate = parts[0].split("/").reverse().join("-");
        const fullString = [newDate, parts[1]].join("T");
        return (new Date(Date.parse(fullString))).getTime();
    }
}

class DayScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * (ViewToScaleFactor.day + zoomFactor);
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        const items = Math.round(difference * (ViewToScaleFactor.day + zoomFactor));
        const width = (1 + zoomFactor);
        return {items: items, width: width, totalWidth: items * width};
    }
}

class WeekScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * ((ViewToScaleFactor.week / 24) + (zoomFactor / 24));
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        const items = Math.round(difference * ((1 / 24) + (zoomFactor / 24)));
        const width = (ViewToScaleFactor.week + (zoomFactor / 24));
        return {items: items, width: width, totalWidth: items * width};
    }
}

class MonthScale {
    async get(min, date, zoomFactor = 0) {
        const differenceInHours = (getDate(date) - getDate(min)) / 3.6e+6;
        return differenceInHours * ((ViewToScaleFactor.month / 24) + (zoomFactor / 24));
    }

    async setScale(min, max, zoomFactor = 0) {
        const difference = Math.abs(getDate(max) - getDate(min)) / 3.6e+6;
        const items = Math.round(difference * ((1 / 24) + (zoomFactor/24)));
        const width = (1 + (zoomFactor / 24));
        return {items: items, width: width, totalWidth: items * width};
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
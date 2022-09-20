const ViewToScaleFactor = Object.freeze({
    "day":   1,
    "week":  1 / 24,    //NOTE KR: this will most likely change when we have what 1 gl unit represents in week view
    "month": 1 / 24,
    "year":  1 / 365
})

class TimelineManager {
    constructor(min, max) {
        this.min = min.getTime();
        this.max = max.getTime();
    }

    async setRange(canvas, min, max) {
        const convertedMin = min.getTime();
        const convertedMax = max.getTime();
        //Creates scales
        //returns minX, maxX
    }

    /**
     * @param start - Start Date
     * @param end - End Date
     * @param scale - day/week/month/year
     */
    async get(start, end, scale) {
        const x1 = this[scale](start);
        const x2 = this[scale](end);
        return {
            x1: x1,
            x2: x2
        }
    }

    day(date) {
        const valueHours = (date.getTime() - this.min) / 3.6e+6;
        return valueHours * ViewToScaleFactor.day;
    }

    week(date) {
        const valueHours = (date.getTime() - this.min) / 3.6e+6;
        return valueHours * ViewToScaleFactor.week;
    }

    month(date) {
        const valueHours = (date.getTime() - this.min) / 3.6e+6;
        return valueHours * ViewToScaleFactor.month;
    }

    year(date) {
        //TODO KR: accuracy can be improved here. Right now dealing with an average.
        const valueHours = (date.getTime() - this.min) / 3.6e+6;
        return valueHours * ViewToScaleFactor.year;
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
        canvas.__timelineManager = new TimelineManager(min, max);
        return await canvas.__timelineManager.setRange(canvas, min, max);
    }

    static async set_range(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const min = (await crs.process.getValue(step.args.min, context, process, item));
        const max = (await crs.process.getValue(step.args.max, context, process, item));
        return await canvas.__timelineManager.setRange(canvas, min, max);
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const start = await crs.process.getValue(step.args.start, context, process, item);
        const end = await crs.process.getValue(step.args.end, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        return await canvas.__timelineManager.get(start, end, scale);
    }
}

crs.intent.time_line = TimelineManagerActions;
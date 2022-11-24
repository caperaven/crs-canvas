import {createHeaderText, createRect} from "../../../timeline-helpers.js";
import {DistanceSystem} from "../../../../../src/helpers/distance-system.js";
import {moveParticle} from "./particle-helpers.js";
import {monthToYearOffset} from "./year-renderer.js";

export default class DayMonthRenderer {
    #distanceSystem;
    #currentDayNumber;
    #currentMonth;
    #currentYear

    #currentMonthOffset
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "day_month_header_bg"
    #textTheme;

    async init(canvas, particleSystem,  baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        this.#textTheme = BABYLON.Color4.FromHexString(canvas._theme.header_text);

        const count = 31;
        const multiplier = 2;
        const textMultiplier = 24;
        const bgCount =  2 * count;

        const shapes = [];

        //get days
        for (let i = 1; i <= count; i++) {
            const dayTextMesh = await createHeaderText(i.toString(), canvas, 0, 0, canvas.__zIndices.headerText, null, true);
            this.#particleSystem.add(i.toString(), dayTextMesh, multiplier, true);
            shapes.push({key:i.toString(), count: multiplier});
        }

        //get months
        const monthDate = new Date();
        for (let i = 0; i < 12; i++) {
            const month = monthDate.toLocaleString('default', { month: 'long' });
            const monthTextMesh = await createHeaderText(month, canvas, 0, 0, canvas.__zIndices.headerText, null, true);
            this.#particleSystem.add(month, monthTextMesh, textMultiplier, true);
            shapes.push({key: month, count: textMultiplier});

            monthDate.setMonth(monthDate.getMonth() + 1);
        }

        //get years
        const baseYear = baseDate.getFullYear();
        for (let i = baseYear  - 20; i < baseYear + 20; i++) {
            const yearTextMesh = await createHeaderText(i.toString(), canvas, 0, 0, canvas.__zIndices.headerText, null, false);
            this.#particleSystem.add(i.toString(), yearTextMesh, textMultiplier, true);
            shapes.push({key:i.toString(), count: textMultiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, canvas.__zIndices.headerBorder,0.02, 0.5, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);

        this.#currentDayNumber = date.getDate();
        this.#currentMonth = date.toLocaleString('default', { month: 'long' });
        this.#currentMonthOffset = monthToYearOffset[this.#currentMonth];
        this.#currentYear = date.getFullYear();
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.25);
        }

        if(this.#currentDayNumber == shape) {
            particle.color = this.#textTheme;
            //NOTE KR: having to add a bunch on the x-offset -> could be because of GMT+2?
            return moveParticle(this.#distanceSystem, particle, shape,this.#currentPosition, 0.2,  -0.35, this.#textScale);
        }

        if (this.#currentMonth == shape) {
            particle.color = this.#textTheme;
            //NOTE KR: having to add a bunch on the x-offset -> could be because of GMT+2?
            return moveParticle(this.#distanceSystem, particle, shape,this.#currentPosition, 0.55,  -0.35, this.#textScale);
        }

        if (this.#currentYear == shape) {
            particle.color = this.#textTheme;
            //NOTE KR: having to add a bunch on the x-offset -> could be because of GMT+2?
            return moveParticle(this.#distanceSystem, particle, shape,this.#currentPosition, 0.25 + this.#currentMonthOffset,  -0.35, this.#textScale);
        }
    }
}
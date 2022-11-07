import {createHeaderText, createRect} from "../../timeline-helpers.js";
import {DistanceSystem} from "../../../../../src/helpers/distance-system.js";
import {moveParticle} from "./particle-helpers.js";

export default class MonthRenderer {
    #distanceSystem;
    #currentDayNumber;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "month_header_bg"
    #weekdayBgKey = "weekend_bg"
    #isWeekday;
    #textTheme;

    async init(canvas, particleSystem,  baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        this.#textTheme = canvas._theme.header_text;

        const count = 31;
        const multiplier = 2;
        const bgCount =  2 * count;
        const weekdayBgCount =  2 * count;

        const shapes = [];

        for (let i = 1; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 10, canvas.__zIndices.headerText, null, true);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            shapes.push({key:i.toString(), count: multiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, canvas.__zIndices.headerBorder,0.02, 0.5, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        const weekdayBg = await createRect(this.#weekdayBgKey, canvas._theme.header_bg, 0, 0, canvas.__zIndices.headerBg,0.985, 0.5, canvas);
        this.#particleSystem.add(this.#weekdayBgKey, weekdayBg, weekdayBgCount, true);
        shapes.push({key: this.#weekdayBgKey, count: weekdayBgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);

        this.#currentDayNumber = date.getDate();
        this.#currentPosition = position;
        const day = date.getDay();
        this.#isWeekday = day !== 0 && day !== 6;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.75);
        }

        if(this.#currentDayNumber == shape) {
            particle.color = BABYLON.Color4.FromHexString(this.#textTheme);
            return moveParticle(this.#distanceSystem, particle, shape,this.#currentPosition, 0.375,  -0.85, this.#textScale);
        }

        if(this.#weekdayBgKey === shape && this.#isWeekday === true) {
            return moveParticle(this.#distanceSystem, particle, this.#weekdayBgKey, this.#currentPosition,0.5, -0.75);
        }
    }
}
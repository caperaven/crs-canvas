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

    async init(canvas, particleSystem,  baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;

        const count = 31;
        const multiplier = 2;
        const bgCount =  2 * count;

        const shapes = [];

        for (let i = 1; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 10);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            shapes.push({key:i.toString(), count: multiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, 0.02, 0.5, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);

        this.#currentDayNumber = date.getDate();
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return  moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.75);
        }

        if(this.#currentDayNumber == shape) {
            return    moveParticle(this.#distanceSystem, particle, shape,this.#currentPosition, 0.375,  -0.85, this.#textScale)
        }
    }
}
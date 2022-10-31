import {createHeaderText, createRect} from "../../timeline-helpers.js";
import {DistanceSystem} from "../../../../../src/helpers/distance-system.js";
import {moveParticle} from "./particle-helpers.js";

export default class WeekRenderer {
    #distanceSystem;
    #currentDayNumber;
    #currentDayText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "week_header_bg"

    async init(canvas, particleSystem, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;

        const count = 31;
        const multiplier = 2;
        const textMultiplier = 8;
        const bgCount =  2 * count;

        const shapes = [];

        for (let i = 0; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 0);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            shapes.push({key:i.toString(), count: multiplier});
        }

        for (let i = 0; i < 7; i++) {
            const date = new Date(this.#baseDate.getTime());
            date.setDate(date.getDate() + i);
            const text = date.toLocaleString('en-us', {weekday:'long'})
            const textMesh = await createHeaderText(text, canvas, 0, 0);
            this.#particleSystem.add(text, textMesh, textMultiplier, true);
            shapes.push({key:text, count: textMultiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, 0.02, 0.5, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);

        this.#currentDayNumber = date.getDate();
        this.#currentDayText = date.toLocaleString('en-us', {weekday:'long'});
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,-3, -0.75);
        }

        if(shape == this.#currentDayText) {
            return moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, -2.4, -0.85, this.#textScale)
        }

        if(this.#currentDayNumber == shape) {
            return moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, -2.8, -0.85, this.#textScale)
        }
    }
}
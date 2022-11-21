import {createHeaderText, createRect} from "../../timeline-helpers.js";
import {DistanceSystem} from "../../../../../src/helpers/distance-system.js";
import {moveParticle} from "./particle-helpers.js";

export default class DayRenderer {
    #distanceSystem;
    #currentDayText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "month_header_bg";
    #textTheme;

    async init(canvas, particleSystem, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        this.#textTheme = canvas._theme.header_text;

        const count = 24;
        const multiplier = 2;
        const textMultiplier = 1;
        const bgCount =  2 * count;

        const shapes = [];

        for (let i = 0; i < count; i++) {
            const date = new Date(this.#baseDate.getTime());
            date.setHours(i,0,0);
            const text = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' , hourCycle: 'h23' });
            const textMesh = await createHeaderText(text, canvas, 0, 10, canvas.__zIndices.headerText);
            this.#particleSystem.add(text, textMesh, textMultiplier, true);
            shapes.push({key:text, count: textMultiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, canvas.__zIndices.headerBorder,0.02, 0.125, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the timescale we need to set the current shape differently
        const date = new Date(this.#baseDate.getTime() + (index * 30) * 60000);
        this.#currentDayText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' ,hourCycle: 'h23' });
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.95);
        }

        if(shape == this.#currentDayText) {
            particle.color = BABYLON.Color4.FromHexString(this.#textTheme);
            return moveParticle(this.#distanceSystem, particle, shape,  this.#currentPosition,-0.375, -0.85, this.#textScale)
        }
    }
}
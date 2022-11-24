import {createHeaderText, createRect} from "../../../timeline-helpers.js";
import {DistanceSystem} from "../../../../../src/helpers/distance-system.js";
import {moveParticle} from "./particle-helpers.js";

export const monthToYearOffset = Object.freeze({
    "January":  1.4,
    "February": 1.55,
    "March": 1.15,
    "April": 1,
    "May": 0.85,
    "June": 1,
    "July": 0.9,
    "August": 1.3,
    "September": 1.8,
    "October": 1.45,
    "November": 1.7,
    "December": 1.7,
})

export default class YearRenderer {
    #distanceSystem;
    #currentMonthText;
    #currentYearText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "year_header_bg";
    #textTheme;

    async init(canvas, particleSystem, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        this.#textTheme = canvas._theme.header_text;

        const count = 11;
        const multiplier = 5;
        const textMultiplier = 8;
        const bgCount =  2 * count;

        const shapes = [];

        for (let i = 0; i <= count; i++) {
            const month = new Date(2022,i,1).toLocaleString('default', { month: 'long' });
            const textMesh = await createHeaderText(month, canvas, 0, 0, canvas.__zIndices.headerText, null, true);
            this.#particleSystem.add(month, textMesh, multiplier, true);
            shapes.push({key:month, count: multiplier});
        }

        const baseYear = baseDate.getFullYear();

        for (let i = baseYear  - 20; i < baseYear + 20; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 0, canvas.__zIndices.headerText);
            this.#particleSystem.add(i.toString(), textMesh, textMultiplier, true);
            shapes.push({key:i.toString(), count: textMultiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, canvas.__zIndices.headerBorder, 0.02, 1, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        const date = new Date(this.#baseDate.getFullYear(), this.#baseDate.getMonth());

        date.setMonth(date.getMonth() + index);

        this.#currentMonthText = date.toLocaleString('default', { month: 'long' });
        this.#currentYearText = date.getFullYear();
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, 0);
        }

        if(shape == this.#currentMonthText) {
            particle.color = BABYLON.Color4.FromHexString(this.#textTheme);
            return moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, 0.2, -0.35, this.#textScale)
        }

        if(this.#currentYearText == shape) {
            particle.color = BABYLON.Color4.FromHexString(this.#textTheme);
            return moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, monthToYearOffset[this.#currentMonthText], -0.35, this.#textScale)
        }
    }
}
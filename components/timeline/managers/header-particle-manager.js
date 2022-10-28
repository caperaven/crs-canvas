import {createHeaderText, createRect} from "./timeline-helpers.js";
import {ParticleSystem} from "../../../src/managers/particle-manager.js";
import {DistanceSystem} from "../../../src/helpers/distance-system.js";

export class HeaderParticleManager {
    #system;
    #currentIndex;
    #currentPosition;
    #baseDate;
    #canvas;
    #renderer;

    #renderers = {
        "month": MonthRenderer,
        "day": DayRenderer,
        "week": WeekRenderer,
        "year": DayRenderer
    }


    constructor() {
        this.#system = {};
        this.updateParticleHandler = this.updateParticle.bind(this);
    }

    dispose() {
        this.#system = this.#system.dispose();
    }

    async initialize(scale, width, baseDate, canvas) {
        this.#baseDate = baseDate;
        this.#canvas = canvas;
        this.#system = new ParticleSystem("timeline_headers", canvas.__layers[0], this.updateParticleHandler);


        this.#renderer = new this.#renderers[scale]();
        await this.#renderer.init(canvas, this.#system, width, this.#baseDate, canvas._text_scale);

        this.#system.build();
    }

    async render(index, position) {
        this.#currentIndex = index;
        this.#currentPosition = position;

         await this.#renderer.setCurrent(index, position)

        await this.#system.render();
    }

    async updateParticle(particle) {

        this.#renderer.move(particle);
    }
}

class MonthRenderer {
    #textDistanceSystem;
    #bgMeshDistanceSystem;
    #currentShape;
    #currentPosition;
    #baseDate;
    #particleSystem;
    #textScale;
    #textOffset = 0.4;
    #bgOffset = 0.5;
    #bgKey = "month_header_bg"

    async init(canvas, particleSystem, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        const count = 31;
        const multiplier = 2;

        const textShapes = [];

        for (let i = 1; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 0);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            textShapes.push(i.toString());
        }

        const bgCount =  2 * count;
        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_bg, 0, 0, 0.98, 0.5, canvas);
        // const bgMesh = await createRect(this.#bgKey, canvas._theme.header_bg, 0, 0, 0.95, 0.5, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        this.#textDistanceSystem = new DistanceSystem(textShapes, multiplier);
        this.#bgMeshDistanceSystem = new DistanceSystem([this.#bgKey], bgCount);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);
        const key = date.getDate();
        this.#currentShape = key;
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return this.#move_bg(particle);
        }

        if(this.#currentShape != shape) return;


        const textPosition = this.#currentPosition + this.#textOffset
        const index = this.#textDistanceSystem.getIndex(this.#currentShape, textPosition);
        if (index != null && particle.idxInShape !== index) return;

        particle.position.x = textPosition;
        particle.position.y = -0.875;
        particle.position.z = -0.01;
        particle.scaling = this.#textScale;

        this.#textDistanceSystem.set(this.#currentShape, particle.idxInShape, textPosition);
    }

    async #move_bg(particle) {
        const bg_position = this.#currentPosition + this.#bgOffset

        if(this.#bgMeshDistanceSystem.has(this.#bgKey, bg_position)) return

        const index = this.#bgMeshDistanceSystem.getIndex(this.#bgKey, bg_position);

        if (index != null && particle.idxInShape !== index) return;

        particle.position.x = bg_position;
        particle.position.y = -0.75;
        particle.position.z = -0.01;

        this.#bgMeshDistanceSystem.set(this.#bgKey, particle.idxInShape, bg_position);
    }
}

class DayRenderer {

    #textDistanceSystem;
    #bgMeshDistanceSystem;
    #currentShape;
    #currentPosition;
    #baseDate;
    #particleSystem;
    #textScale;
    #textOffset = 0.4;
    #bgOffset = 0.5;
    #bgKey = "month_header_bg"

    async init(canvas, particleSystem, width, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;
        const count = 31;
        const multiplier = 2;

        const textShapes = [];

        console.log(width);

        for (let i = 1; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 0);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            textShapes.push(i.toString());
        }

        const bgCount =  2 * count;
        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_bg, 0, 0, width-0.002, 0.5, canvas);

        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        this.#textDistanceSystem = new DistanceSystem(textShapes, multiplier);
        this.#bgMeshDistanceSystem = new DistanceSystem([this.#bgKey], bgCount);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);
        const key = date.getDate();
        this.#currentShape = key;
        console.log(position);
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return this.#move_bg(particle);
        }

        if(this.#currentShape != shape) return;


        const textPosition = this.#currentPosition + this.#textOffset
        const index = this.#textDistanceSystem.getIndex(this.#currentShape, textPosition);
        if (index != null && particle.idxInShape !== index) return;

        particle.position.x = textPosition;
        particle.position.y = -0.875;
        particle.position.z = -0.01;
        particle.scaling = this.#textScale;

        this.#textDistanceSystem.set(this.#currentShape, particle.idxInShape, textPosition);
    }

    async #move_bg(particle) {
        const bg_position = this.#currentPosition + this.#bgOffset

        if(this.#bgMeshDistanceSystem.has(this.#bgKey, bg_position)) return

        const index = this.#bgMeshDistanceSystem.getIndex(this.#bgKey, bg_position);

        if (index != null && particle.idxInShape !== index) return;

        particle.position.x = bg_position;
        particle.position.y = -0.75;
        particle.position.z = -0.01;

        this.#bgMeshDistanceSystem.set(this.#bgKey, particle.idxInShape, bg_position);
    }
}

class WeekRenderer {

    #textDistanceSystem;
    #dayTextDistanceSystem;
    #bgMeshDistanceSystem;
    #currentDayNumber;
    #currentDayText;
    #currentPosition;
    #baseDate;
    #particleSystem;
    #textScale;
    #textOffset = 0.4;
    #bgOffset = 0.5;
    #bgKey = "month_header_bg"

    async init(canvas, particleSystem, width, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;

        const count = 31;
        const multiplier = 2;

        const textShapes = [];

        console.log(width);

        for (let i = 1; i <= count; i++) {
            const textMesh = await createHeaderText(i.toString(), canvas, 0, 0);
            this.#particleSystem.add(i.toString(), textMesh, multiplier, true);
            textShapes.push(i.toString());
        }

        for (let i = 0; i < 7; i++) {
            const date = new Date(this.#baseDate.getTime());
            date.setDate(date.getDate() + i);
            const text = date.toLocaleString('en-us', {weekday:'long'})
            console.log("text", text);
            const textMesh = await createHeaderText(text, canvas, 0, 0);
            this.#particleSystem.add(text, textMesh, multiplier, true);
            textShapes.push(text);
        }



        const bgCount =  2 * count;
        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_bg, 0, 0, width-0.02, 0.5, canvas);

        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        this.#textDistanceSystem = new DistanceSystem(textShapes, multiplier);
        this.#dayTextDistanceSystem = new DistanceSystem(textShapes, multiplier);
        this.#bgMeshDistanceSystem = new DistanceSystem([this.#bgKey], bgCount);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime());
        date.setDate(date.getDate() + index);

        this.#currentDayNumber = date.getDate();
        this.#currentDayText = date.toLocaleString('en-us', {weekday:'long'});
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
           return  this.#move(this.#bgMeshDistanceSystem, particle, this.#bgKey, 0.5, -0.75);
        }

        if(shape == this.#currentDayText) {
          return   this.#move(this.#dayTextDistanceSystem, particle, shape, -0.5, -0.85, this.#textScale)
        }

        if(this.#currentDayNumber == shape) {
         return     this.#move(this.#textDistanceSystem, particle, shape, -1, -0.85, this.#textScale)
        }
    }

    async #move(system, particle, key, xOffset, yOffset, scale) {
        const next_position_x = this.#currentPosition + xOffset

        const index = system.getIndex(key, next_position_x);

        if (index != null && particle.idxInShape !== index) return;

        particle.position.x = next_position_x;
        particle.position.y = yOffset;
        particle.position.z = -0.01;

        if(scale != null) {
            particle.scaling = scale;
        }

        system.set(key, particle.idxInShape, next_position_x);
    }
}



import {createHeaderText, createRect} from "./timeline-helpers.js";
import {ParticleSystem} from "../../../src/managers/particle-manager.js";
import {DistanceSystem} from "../../../src/helpers/distance-system.js";

export class HeaderParticleManager {

    #system;
    #currentIndex;
    #currentPosition;
    #baseDate;
    #renderer;

    #renderers = {
        "month": MonthRenderer,
        "day": DayRenderer,
        "week": WeekRenderer,
        "year": YearRenderer
    }

    constructor() {
        this.#system = {};
        this.updateParticleHandler = this.updateParticle.bind(this);
    }

    dispose() {
        this.#system = this.#system.dispose();
    }

    async initialize(scale, baseDate, canvas, systemId = "timeline_headers") {
        this.#baseDate = baseDate;
        this.#system = new ParticleSystem(systemId, canvas.__layers[0], this.updateParticleHandler);


        this.#renderer = new this.#renderers[scale]();
        await this.#renderer.init(canvas, this.#system, this.#baseDate, canvas._text_scale);

        this.#system.build();
    }

    async render(index, position) {
        this.#currentIndex = index;
        this.#currentPosition = position;

         await this.#renderer.setCurrent(index, position)

        await this.#system.render();
    }

    async updateParticle(particle) {
        await this.#renderer.move(particle);
        if(particle.isUsed !== true) {
            particle.position.y = 99999;
        }
    }
}



class DayRenderer {
    #distanceSystem;
    #currentDayText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "month_header_bg"

    async init(canvas, particleSystem, baseDate, textScale) {
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;

        const count = 24;
        const multiplier = 2;
        const textMultiplier = 1;
        const bgCount =  2 * count;

        const shapes = [];

        for (let i = 0; i < count; i++) {
            const date = new Date(this.#baseDate.getTime());
            date.setHours(i,0,0);
            const text = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' ,hour12: false });
            const textMesh = await createHeaderText(text, canvas, 0, 10);
            this.#particleSystem.add(text, textMesh, textMultiplier, true);
            shapes.push({key:text, count: textMultiplier});
        }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, 0.02, 0.125, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        // Each timescale is different. So depending on the timescale we need to set the current shape differently

        const date = new Date(this.#baseDate.getTime() + (index * 30) * 60000);
        this.#currentDayText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' ,hour12: false });
        this.#currentPosition = position;
    }

    async move(particle) {
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return  moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.95);
        }

        if(shape == this.#currentDayText) {
            return   moveParticle(this.#distanceSystem, particle, shape,  this.#currentPosition,-0.375, -0.85, this.#textScale)
        }
    }
}

class WeekRenderer {
    #distanceSystem;
    #currentDayNumber;
    #currentDayText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "week_header_bg"

    async init(canvas, particleSystem, baseDate, textScale) {
        console.log("init week")
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
           return  moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, -0.75);
        }

        if(shape == this.#currentDayText) {
          return   moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, 0, -0.85, this.#textScale)
        }

        if(this.#currentDayNumber == shape) {
         return    moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, 0, -0.85, this.#textScale)
        }
    }
}

class MonthRenderer {
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

class YearRenderer {
    #distanceSystem;
    #currentMonthText;
    #currentYearText;
    #currentPosition;

    #baseDate;

    #particleSystem;
    #textScale;
    #bgKey = "year_header_bg"

    async init(canvas, particleSystem, baseDate, textScale) {
        console.log("initiating year header background")
        this.#textScale = textScale;
        this.#baseDate = baseDate;
        this.#particleSystem = particleSystem;

        const count = 12;
        const multiplier = 2;
        const textMultiplier = 8;
        const bgCount =  2 * count;

        const shapes = [];


        // TODO KR: fix this
        // for (let i = 0; i <= count; i++) {
        //     const month = new Date(2022,i,1).toLocaleString('default', { month: 'long' });
        //     const textMesh = await createHeaderText(month, canvas, 0, 0);
        //     this.#particleSystem.add(month, textMesh, multiplier, true);
        //     shapes.push({key:month, count: multiplier});
        // }
        //
        // const baseYear = baseDate.getFullYear();
        //
        // for (let i = baseYear  - 20; i < baseYear + 20; i++) {
        //     const textMesh = await createHeaderText(i.toString(), canvas, 0, 0);
        //     this.#particleSystem.add(i.toString(), textMesh, textMultiplier, true);
        //     shapes.push({key:i.toString(), count: textMultiplier});
        // }

        const bgMesh = await createRect(this.#bgKey, canvas._theme.header_border, 0, 0, 0.02, 1, canvas);
        this.#particleSystem.add(this.#bgKey, bgMesh,bgCount, true);
        shapes.push({key: this.#bgKey, count: bgCount});

        this.#distanceSystem = new DistanceSystem(shapes, multiplier);
    }

    async setCurrent(index, position) {
        console.log("set current", index, position);
        // Each timescale is different. So depending on the time scale we need to set the current shape differently

        const date = new Date(this.#baseDate.getFullYear(), this.#baseDate.getMonth());

        date.setMonth(date.getMonth() + index);

        this.#currentMonthText = date.toLocaleString('default', { month: 'long' });
        this.#currentYearText = date.getFullYear();
        this.#currentPosition = position;
    }

    async move(particle) {
        // console.log("move", particle);
        const shape = this.#particleSystem.getKeyById(particle.shapeId);
        if(this.#bgKey === shape) {
            return moveParticle(this.#distanceSystem, particle, this.#bgKey, this.#currentPosition,0, 0);
        }

        if(shape == this.#currentMonthText) {
            return moveParticle(this.#distanceSystem, particle, shape, this.#currentPosition, 0.1, -0.25, this.#textScale)
        }

        if(this.#currentYearText == shape) {
            return moveParticle(this.#distanceSystem, particle, shape,  this.#currentPosition,1.55, -0.25, this.#textScale)
        }
    }
}

function moveParticle(system, particle, key, position,  xOffset, yOffset, scale) {
    const next_position_x = position + xOffset

    const index = system.getIndex(key, next_position_x);

    if (index != null && particle.idxInShape !== index) return;

    particle.position.x = next_position_x;
    particle.position.y = yOffset;
    particle.position.z = -0.01;
    particle.isUsed = true;

    if(scale != null) {
        particle.scaling = scale;
    }

    system.set(key, particle.idxInShape, next_position_x);
}
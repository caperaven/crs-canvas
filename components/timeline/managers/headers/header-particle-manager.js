import {ParticleSystem} from "../../../../src/managers/particle-manager.js";

export class HeaderParticleManager {

    #system;
    #currentIndex;
    #currentPosition;
    #baseDate;
    #renderer;

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

        const module = await import(`./renderers/${scale}-renderer.js`);
        this.#renderer = new module.default();
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
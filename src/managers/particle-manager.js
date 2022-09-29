class ParticleSystemsManager {
    constructor(canvas) {
        canvas.__particleSystems = this;
    }

    add(systemId, shapes, particleCallback, canvas, scene) {
        if (canvas.__particleSystems[systemId] != null) return;
        const system = new ParticleSystem(systemId, scene);

        for (const shapeKey of Object.keys(shapes)) {
            const shape = shapes[shapeKey];
            system.add(shapeKey, shape.mesh, shape.positions, shape.disposeSourceMesh)
        }
        system.render(particleCallback);
        canvas.__particleSystems[systemId] = system;

        return system;
    }

    remove(systemId, canvas) {
        if (canvas.__particleSystems[systemId] == null) return;

        canvas.__particleSystems[systemId] = canvas.__particleSystems[systemId].dispose();
    }
}

export class ParticleSystem {
    #SPS;
    #mesh;
    #shapes = {};

    get mesh() {
        return this.#mesh;
    }

    constructor(systemId, scene) {
        this.#SPS = new BABYLON.SolidParticleSystem(systemId, scene, {
            useModelMaterial: true
        });

        this.#SPS.initParticles = this.#initParticles.bind(this);
    }

    dispose() {
        this.#SPS = this.#SPS.dispose();
        this.#mesh = this.#mesh?.dispose();
        this.#shapes = null;
    }

    add(key, sourceMesh, positions, disposeSourceMesh = true) {
        const id = this.#SPS.addShape(sourceMesh, positions.length);
        this.#shapes[id] = {
            key,
            positions
        };
        disposeSourceMesh && sourceMesh.dispose();
    }

    render(initParticleCallback) {
        this.#mesh = this.#SPS.buildMesh();
        this.#SPS.isAlwaysVisible = true; // TODO Customize this as parameter
        this.#SPS.initParticles(initParticleCallback);
        this.#SPS.setParticles();
    }

    #initParticles(callback) {
        for (let p = 0; p < this.#SPS.nbParticles; p++) {
            const particle = this.#SPS.particles[p];
            const shape = this.#shapes[particle.shapeId];
            const pIndex = particle.idxInShape * 3;

            const x = shape.positions[pIndex];
            const y = shape.positions[pIndex + 1];
            const z = shape.positions[pIndex + 2];

            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;

            callback(shape.key, particle, p); // Do whatever you want with particle before render
        }
    }
}

export class ParticleManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__particleSystems = new ParticleManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__particleSystems = canvas.__particleSystems.dispose();
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const systemId = await crs.process.getValue(step.args.id, context, process, item);
        const shapes = await crs.process.getValue(step.args.shapes, context, process, item);
        const callback = await crs.process.getValue(step.args.particleCallback, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        if (canvas.__particleSystems == null) {
            new ParticleSystemsManager(canvas);
        }

        const system = await canvas.__particleSystems.add(systemId, shapes, callback, canvas, scene);
        return system;
    }

    static async remove(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const index = await crs.process.getValue(step.args.index, context, process, item);
        const positions = await crs.process.getValue(step.args.positions, context, process, item);
        await canvas.__instances.remove(id, index, positions);
    }
}

crs.intent.gfx_particles = ParticleManagerActions;
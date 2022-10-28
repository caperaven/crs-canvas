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
    #shapes = {}

    get mesh() {
        return this.#mesh;
    }

    constructor(systemId, scene, updateCallback) {
        this.#SPS = new BABYLON.SolidParticleSystem(systemId, scene, {
            useModelMaterial: true
        });
        this.#SPS.updateParticle = updateCallback;
    }

    dispose() {
        this.#SPS = this.#SPS.dispose();
        this.#mesh = this.#mesh?.dispose();
        this.#shapes = null;
    }

    getKeyById(id) {
        return this.#shapes[id];
    }

    add(key, sourceMesh, count, disposeSourceMesh = true) {
        const id = this.#SPS.addShape(sourceMesh, count);
        this.#shapes[id] = key;
        disposeSourceMesh && sourceMesh.dispose();
    }

    build() {
        this.#mesh = this.#SPS.buildMesh();
        this.#SPS.isAlwaysVisible = true; // TODO Customize this as parameter
    }

    init(callback) {
        this.#SPS.initParticles(callback);
    }

    render() {
        this.#SPS.setParticles();
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
        await canvas.__particleSystems.remove(id, canvas);
    }
}

crs.intent.gfx_particles = ParticleManagerActions;
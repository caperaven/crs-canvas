class MaterialsManager {
    constructor(scene) {
        this.store = {
            "transparent": new BABYLON.StandardMaterial("#000000", scene)
        }

        this.textures = {}
        this.shaders = {}

        this.store.transparent.diffuseColor = BABYLON.Color3.FromHexString("#ff0010");
        this.store.transparent.alpha = 0;
    }

    dispose() {
        for (const key of Object.keys(this.store)) {
            this.store[key]?.dispose();
        }
        this.store = null;

        for (const key of Object.keys(this.textures)) {
            this.textures[key]?.dispose();
        }
        this.textures = null;
    }

    async getMaterial(id, value, diffuse, scene) {
        if (this.store[id] == null) {
            const color = BABYLON.Color3.FromHexString(value);
            const material = new BABYLON.StandardMaterial(value, scene);

            if (diffuse) {
                material.diffuseColor = color;
            }
            else {
                material.emissiveColor = color;
            }

            this.store[id] = material;
        }

        return this.store[id];
    }

    async getTexture(id, texture) {
        if (this.textures[id] == null) {
            this.textures[id] = new BABYLON.Texture(`${crs.intent.gfx.assetsLocation}/${texture}`);
        }

        return this.textures[id];
    }

    async getTextureMaterial(id, texture, scene) {
        if (this.store[id] == null) {
            const material = new BABYLON.StandardMaterial(id, scene);
            material.emissiveTexture = await this.getTexture(id, texture);
            this.store[id] = material;
        }

        return this.store[id];
    }

    async getShader(id, texture, attributes, scene) {
        if (this.shaders[id] == null) {
            const fragCode = await fetch(`${crs.intent.gfx.assetsLocation}/shaders/${id}.frag`).then(result => result.text());
            const vertCode = await fetch(`${crs.intent.gfx.assetsLocation}/shaders/${id}.vert`).then(result => result.text());

            BABYLON.Effect.ShadersStore[`${id}VertexShader`] = vertCode;
            BABYLON.Effect.ShadersStore[`${id}FragmentShader`] = fragCode;

            const material = new BABYLON.ShaderMaterial(id, scene,
                {
                    vertex: id,
                    fragment: id
                },
                {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
                    needAlphaBlending: true
                }
            );

            if (texture != null) {
                const textureResult = await this.getTexture(id, texture);
                material.setTexture("texture1", textureResult);
            }

            if (attributes != null) {
                for (let attribute of attributes) {
                    const fn = `set${attribute.fn}`;
                    material[fn](attribute.name, attribute.value);
                }
            }

            this.shaders[id] = material;
        }

        return this.shaders[id];
    }

    /**
     * JHR: Note
     * use material id, if id not given use material color or texture name
     * get must not assume color
     * add set function
     */
}

class MaterialsManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        canvas.__materials = new MaterialsManager(canvas.__layers[layer]);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__materials = canvas.__materials?.dispose();
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const value = await crs.process.getValue(step.args.value, context, process, item);
        const diffuse = await crs.process.getValue(step.args.diffuse, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        return await canvas.__materials.getMaterial(id, value, diffuse, scene);
    }

    static async get_textured(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const texture = await crs.process.getValue(step.args.texture, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];
        return await canvas.__materials.getTextureMaterial(id, texture, scene);
    }

    static async get_shader(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const id = await crs.process.getValue(step.args.id, context, process, item);
        const texture = await crs.process.getValue(step.args.texture, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const attributes = await crs.process.getValue(step.args.attributes, context, process, item);
        const scene = canvas.__layers[layer];
        return await canvas.__materials.getShader(id, texture, attributes, scene);
    }
}

crs.intent.gfx_materials = MaterialsManagerActions;

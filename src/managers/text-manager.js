import {font as regularFont} from "./font-atlas/font.js"
import {font as boldFont} from "./font-atlas/font_bold.js";
import {getCharData} from "./utils/char-data.js";

class TextManager {
    #regular;
    #bold;

    constructor() {
        this.#regular = {};
        this.#bold = {};
    }

    dispose() {
        for (const key of Object.keys(this.#regular)) {
            this.#regular[key] = null;
        }

        for (const key of Object.keys(this.#bold)) {
            this.#bold[key] = null;
        }

        this.#regular = null;
        this.#bold = null;
    }

    has(text, bold = false) {
        if (bold == true) {
            return this.#bold[text] != null;
        }

        return this.#regular[text] != null;
    }

    get(text, bold = false) {
        if (bold == true) {
            return this.#bold[text];
        }

        return this.#regular[text];
    }

    set(text, mesh, bold = false) {
       if (bold == true) {
           return this.#bold[text] = mesh;
       }

       this.#regular[text] = mesh;
    }

    delete(text, bold = false) {
        if (bold == true) {
            delete this.#bold[text];
        }

        delete this.#regular[text];
    }

    clone(text, bold = false) {
        const mesh = this.get(text, bold);
        const clone = mesh.clone();
        clone.material = mesh.material;
        return clone;
    }
}

export class TextManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__text = new TextManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__text = canvas.__text?.dispose();
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const bold = await crs.process.getValue(step.args.bold, context, process, item) || false;
        const color = await crs.process.getValue(step.args.color || {r: 1, g: 1, b: 1, a: 1}, context, process, item);
        const position = (await crs.process.getValue(step.args.position, context, process, item)) || {x: 0, y: 0, z: 0};
        const attributes = await crs.process.getValue(step.args.attributes, context, process, item);
        const scene = canvas.__layers[layer];
        const font = bold == true ? boldFont : regularFont;
        const text = await this.#sanitiseText(await crs.process.getValue(step.args.text, context, process, item), font);

        //NOTE KR: issue on the clone within timeline.
        // if (canvas.__text.has(text, bold)) {
        //     const clonedMesh = canvas.__text.clone(text, bold);
        //     clonedMesh.position.x = position.x || 0;
        //     clonedMesh.position.y = position.y || 0;
        //     clonedMesh.position.z = position.z || 0;
        //     return clonedMesh;
        // }

        const data = new BABYLON.VertexData();
        data.positions = [];
        data.indices = [];
        data.uvs = [];
        data.normals = [];
        data.colors = [];

        let xadvance = 0;
        let c = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char == " ") {
                xadvance += 0.3;
                continue;
            }

            const charData = getCharData(font, char, xadvance, c * 4);
            data.positions.push(...charData.positions);
            data.indices.push(...charData.indices);
            data.uvs.push(...charData.uvs);
            data.normals.push(...charData.normals);

            for (let i = 0; i < charData.positions.length; i += 3) {
                data.colors.push(color.r, color.g, color.b, color.a);
            }

            xadvance += charData.xadvance;
            c += 1;
        }

        const customMesh = new BABYLON.Mesh(text, scene);
        data.applyToMesh(customMesh);

        customMesh.position.set(position.x || 0, position.y || 0, position.z || 0);
        customMesh.scaling.x = 1;
        customMesh.scaling.y = 1;

        const name = bold == true ? "text_bold" : "text_regular";
        const texture = bold == true ? "textures/sdf_font_bold.png" : "textures/sdf_font.png";

        const material = await crs.call("gfx_materials", "get_shader", {
            element: canvas,
            id: "sdf",
            name: name,
            texture: texture,
            attributes: attributes
        });

        customMesh.material = material;
        canvas.__text.set(text, customMesh, bold);
        return customMesh;
    }

    /**
     * Removes any non-supported special characters within the text
     * @param text {string} - The text to check for non-supported special characters
     * @param font {Object} - The font being rendered
     */
    static async #sanitiseText(text, font) {
        const supportedChars = Object.keys(font.chars);
        let sanitisedText = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (supportedChars.includes(char)) {
                sanitisedText += char;
            }
        }

        return sanitisedText;
    }
}

crs.intent.gfx_text = TextManagerActions;
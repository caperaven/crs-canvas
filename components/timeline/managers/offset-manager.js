/**
 * Responsible for holding offsets and returning a specified offset
 */
class OffsetManager {
    #xOffsets;
    #yOffsets;
    #zOffsets;
    #axisToOffset = {
        "x": this.#xOffsets,
        "y": this.#yOffsets,
        "z": this.#zOffsets,
    }

    dispose() {
        this.#axisToOffset = null;
        this.#xOffsets = null;
        this.#yOffsets = null;
        this.#zOffsets = null;
    }

    addOffsets(offsets) {
        const offsetKeys = Object.keys(offsets);
        for (const offset of offsetKeys) {
            const offsetProperties = Object.keys(offsets[offset]);
            for (const offsetProperty of offsetProperties) {
                const value = offsets[offset][offsetProperty];
                this.add(offset, offsetProperty, value);
            }
        }
    }

    add(axis, key, value) {
        if (this.#axisToOffset[axis] == null) this.#axisToOffset[axis] = {};

        this.#axisToOffset[axis][key] = value;
    }

    remove(axis, offsetKey) {
        if (this.#axisToOffset[axis] == null) return;

        if (this.has(axis, offsetKey)) delete this.#axisToOffset[axis][offsetKey];
    }

    has(axis, offsetKey) {
        if (this.#axisToOffset[axis] == null) return false;

        return this.#axisToOffset[axis][offsetKey] != null;
    }

    get(axis, offsetKey) {
        if (this.#axisToOffset[axis] == null) return;

        return this.#axisToOffset[axis][offsetKey];
    }
}

class OffsetManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const offsets = await crs.process.getValue(step.args.offsets, context, process, item);

        canvas.__offsets = new OffsetManager();

        if (offsets != null) {
            canvas.__offsets.addOffsets(offsets);
        }
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__offsets?.dispose();
        canvas.__offsets = null;
    }

    static async add(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const offsets = await crs.process.getValue(step.args.offsets, context, process, item);

        canvas.__offsets.addOffsets(offsets);
    }

    static async remove(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const axis = await crs.process.getValue(step.args.axis, context, process, item);
        const offset = await crs.process.getValue(step.args.offset, context, process, item);

        canvas.__offsets.remove(axis, offset);
    }

    static async has(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const axis = await crs.process.getValue(step.args.axis, context, process, item);
        const offset = await crs.process.getValue(step.args.offset, context, process, item);

        return canvas.__offsets.has(axis, offset);
    }

    static async get(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const axis = await crs.process.getValue(step.args.axis, context, process, item);
        const offset = await crs.process.getValue(step.args.offset, context, process, item);

       return canvas.__offsets.get(axis, offset) ;
    }
}

crs.intent.offset_manager = OffsetManagerActions;
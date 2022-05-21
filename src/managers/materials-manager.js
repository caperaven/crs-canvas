class MaterialsManagerActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }
}

crs.intent.gfx_materials = MaterialsManagerActions;

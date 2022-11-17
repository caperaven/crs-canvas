import {SceneManagerActions} from "../../src/managers/scene-manager.js";

class TimelineActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }


    static async get_selected(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);

        const result = {
            index: timeline.selectedIndex,
            item: timeline.selectedItem
        }

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, result, context, process, item);
        }

        return result;
    }

    static async update_item(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);

        const updatedItem =  await crs.process.getValue(step.args.updatedItem, context, process, item);
        const index =  await crs.process.getValue(step.args.index, context, process, item);

        const selectedItem = await timeline.update(index, updatedItem);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, selectedItem, context, process, item);
        }

        return selectedItem;
    }

   // TODO GM Add actions we need
    // Render
    // Change scale
    // Jump to date
    // Jump to row
    //
}

crs.intent.gfx_timeline = TimelineActions;
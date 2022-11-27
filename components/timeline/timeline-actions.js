class TimelineActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async go_to_selected(step, context, process, item) {
        const selected = await this.get_selected(step, context, process, item);
        if (selected.index == null || selected.item == null) return;

        const field = await crs.process.getValue(step.args.field, context, process, item);
        if (selected.item[field] == null) return;

        const timeline = await crs.dom.get_element(step, context, process, item);
        await this.jump_to_date({
            args: {
                element: timeline?.canvas,
                base: timeline?.baseDate,
                date: selected.item[field],
                scale: timeline?.scale
            }});
    }

    static async set_scale(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        await timeline.setScale(scale);
    }

    static async jump_to_date(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const baseDate = await crs.process.getValue(step.args.base, context, process, item);
        const date = await crs.process.getValue(step.args.date, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);

        const result = await crs.call("gfx_timeline_manager", "get", {element: canvas, start: baseDate, end: date, scale: scale});
        canvas.__camera.position.x = result.x2;
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
}

crs.intent.gfx_timeline = TimelineActions;
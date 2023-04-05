import {TimelineParser} from "./parser/timeline-parser.js";
import {updateCameraLimits} from "./timeline-camera.js";

export class TimelineActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async go_to_selected(step, context, process, item) {
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;
        const selected = await this.get_selected(step, context, process, item);
        if (selected.index == null || selected.item == null) return;

        const field = await crs.process.getValue(step.args.field, context, process, item);
        if (selected.item[field] == null) return;

        await this.jump_to_date({
            args: {
                element: timeline?.canvas,
                base: timeline?.baseDate,
                date: selected.item[field],
                scale: timeline?.scale
            }});
    }

    static async set_scale(step, context, process, item) {
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        await timeline.setScale(scale);
    }

    static async jump_to_today(step, context, process, item) {
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;

        await this.jump_to_date({
            args: {
                element: timeline?.canvas,
                base: timeline?.baseDate,
                date: new Date(),
                scale: timeline?.scale
            }
        });
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
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;

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
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;

        const updatedItem =  await crs.process.getValue(step.args.updatedItem, context, process, item);
        const index =  await crs.process.getValue(step.args.index, context, process, item);

        const selectedItem = await timeline.update(index, updatedItem);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, selectedItem, context, process, item);
        }

        return selectedItem;
    }

    static async initialize(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);
        let schema = await crs.process.getValue(step.args.schema, context, process, item);

        timeline.__parser = await crs.createSchemaLoader(new TimelineParser());

        if(schema == null) {
            schema = await fetch(timeline.dataset.config).then(result => result.json());
        }
        await timeline.__parser.parse(schema, timeline);
        await timeline.init();

        await timeline.render(true);
    }

    static async render(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);
        await timeline.render();
    }

    static async update_config(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);
        let schema = await crs.process.getValue(step.args.schema, context, process, item);

        await timeline.__parser.parse(schema, timeline);

        await timeline.render();
    }

    static async resize(step, context, process, item) {
        const timeline = await crs.dom.get_element(step, context, process, item);
        if (timeline.disabled) return;

        await timeline.resize();
    }

    static zoom_in(step, context, process, item) {
        step.args.direction = 1;
        return this.zoom(step, context, process, item);
    }

    static zoom_out(step, context, process, item) {
        step.args.direction = -1;
        return this.zoom(step, context, process, item);
    }

    static async zoom(step, context, process, item) {
        const timeline = await crs.dom.get_element(step.args.element, context, process, item);
        const direction = await crs.process.getValue(step.args.direction, context, process, item);

        await timeline.adjustZoom(direction);
    }
}

crs.intent.gfx_timeline = TimelineActions;
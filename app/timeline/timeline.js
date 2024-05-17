import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js";
import {workOrderSamples, getRandomData} from "./sample_data.js";
import "./../../packages/crs-framework/components/context-menu/context-menu-actions.js";
import "./../../components/timeline/timeline-actions.js"


export default class Timeline extends crsbinding.classes.ViewBase {

    get targetDate() {
        return this.getProperty("targetDate");
    }

    set targetDate(newValue) {
        this.setProperty("targetDate", newValue);
    }

    async connectedCallback() {
        this.timeline = document.querySelector("crs-timeline")
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        this.timeline = null;
        await super.disconnectedCallback();
    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.timeline.querySelector("canvas")
        });
    }

    async resetData(value) {
        for (const item of this.timeline._tempData) {
            item.startOn = `2022/12/08 12:00:00.000`;
            item.completeBy = `2022/12/10 12:00:00.000`;

            item.receivedOn = `2022/12/08 12:00:00.000`;
            item.requiredBy = `2022/12/10 12:00:00.000`;

            item.workStartedOn = `2022/12/08 12:00:00.000`;
            item.completedOn = `2022/12/10 12:00:00.000`;
        }

        this.timeline.render();
    }

    async load() {
        super.load();
        await this.loadNewShapes();
    }

    async setScale(scale) {
        this.timeline.dataset.scale = scale;
        this.timeline.setScale(scale);
    }

    async showContextMenu(event) {
        await crs.call("context_menu", "show", {
            point: {x: event.clientX, y: event.clientY},
            icon_font_family: "crsfrw",
            options: [
                {
                    id: "item1",
                    title: "Change Date & Time",
                    icon: "calendar",
                    tags: "approved",
                    type: "gfx_timeline",
                    action: "get_selected",
                    args: {element: "#timeline"},
                    attributes: {"aria-hidden.if": "status == 'b'"}
                },
            ],
            callback: async (event) => {

                const selected = await crs.call("gfx_timeline", "get_selected", {element: "#timeline"});

                const updateItem = selected.item;

                updateItem.startOn = `2022/11/07 12:00:00.000`;
                updateItem.completeBy = `2022/11/08 12:00:00.000`;

                updateItem.receivedOn = `2022/11/07 12:00:00.000`;
                updateItem.requiredBy = `2022/11/08 12:00:00.000`;

                updateItem.workStartedOn = `2022/11/07 12:00:00.000`;
                updateItem.completedOn = `2022/11/08 12:00:00.000`;

                await crs.call("gfx_timeline", "update_item", {
                    element: "#timeline",
                    index: selected.index,
                    updatedItem: updateItem
                });
            }
        }, {status: "a"});
    }

    jumpToDate() {
        if (this.targetDate == null) return;
        this.timeline.jumpToDate(new Date(this.targetDate));
    }

    async jumpToSelected() {
        await crs.call("gfx_timeline", "go_to_selected", {element: this.timeline, field: "startOn"});
    }

    async loadNewShapes() {
        const schema = await fetch("/app/timeline/shapes.json").then((response) => response.json());
        await crs.call("gfx_timeline", "initialize", {element: this.timeline, schema: schema});
    }

    async updateShapes() {
        const schema = await fetch("/app/timeline/shapes.json").then((response) => response.json());

        schema.body.elements[0].textTemplates.pop();

        schema.body.elements[0].shapes.pop();
        schema.body.elements[0].shapes.pop();
        await crs.call("gfx_timeline", "update_config", {element: this.timeline, schema: schema});
    }

    async zoomCameraOut() {
        await crs.call("gfx_timeline", "zoom_out", {element: this.timeline});
    }

    async zoomCameraIn() {
        await crs.call("gfx_timeline", "zoom_in", {element: this.timeline});
    }
}

class FakeDatasource {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async load(step) {
        const element = step.args.element;

        if(element._tempData) return element._tempData;

        element._tempData = getRandomData();
        return element._tempData;
    }

    static async get_by_index(step) {
        const element = step.args.element;
        const index = step.args.index;

        return element._tempData[index];
    }

}

crs.intent.timeline_datasource = FakeDatasource;
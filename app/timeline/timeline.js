import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js";
import {workOrderSamples, getRandomData} from "./sample_data.js";
import "./../../packages/crs-framework/components/context-menu/context-menu-actions.js";
import "./../../components/timeline/timeline-actions.js"


export default class Timeline extends crsbinding.classes.ViewBase {

    async connectedCallback() {
        this.timeline = document.querySelector("crs-timeline")
        await super.connectedCallback();



    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.timeline.querySelector("canvas")
        });
    }

    async setTimelineData() {
        this.timeline.render(getRandomData());
    }

    async resetData(value) {
        this.timeline.render(getRandomData(value));
    }

    async setScale(scale) {
        this.timeline.dataset.scale = scale;
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
}
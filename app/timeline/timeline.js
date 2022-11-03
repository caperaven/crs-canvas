import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js";
import {workOrderSamples} from "./sample_data.js";

export default class Timeline extends crsbinding.classes.ViewBase {

    async connectedCallback() {
        this.timeline = document.querySelector("crs-timeline")
        await super.connectedCallback();

        this.timeline.addEventListener("selection-changed", (e)=> {
            console.log("new selection", e.detail);
        })

    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.timeline.querySelector("canvas")
        });
    }

    async setTimelineData() {
        this.timeline.render(workOrderSamples);
    }

    async setScale(scale) {
        this.timeline.dataset.scale = scale;
    }
}
import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js";
import {workOrderSamples} from "./sample_data.js";

export default class Timeline extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        const timeline = this._element.querySelector("crs-timeline");
        console.log(timeline);
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: document.querySelector("crs-timeline").querySelector("canvas")
        });
    }

    setTimelineData(){
        const timeline = this._element.querySelector("crs-timeline");
        timeline.render(workOrderSamples);
    }
}
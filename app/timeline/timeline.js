import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js";
import {workOrderSamples} from "./sample_data.js";

export default class Timeline extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }

    async showInspector() {

        await crs.call("gfx_stats", "addInspector", {
            element: document.querySelector("crs-timeline").shadowRoot.querySelector("canvas")
        });
    }

    setData(){
        const timeline = this._element.querySelector("crs-timeline");
        timeline.data = workOrderSamples
    }
}
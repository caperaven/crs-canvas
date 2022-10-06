import "./../../components/timeline/timeline.js"
import "./../../src/managers/stats-manager.js"

export default class Timeline extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: "canvas"
        });
    }
}
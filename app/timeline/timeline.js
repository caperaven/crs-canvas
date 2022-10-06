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

        await crs.call("gfx_custom_shapes", "add", {
            element: "canvas",
            shape: "arrow_line",
            width: 21.35,
            position: {
                x: 0,
                y: 1,
                z: -0.01
            }
        });
    }
}
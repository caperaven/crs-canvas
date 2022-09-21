import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";


export default class SdfShapes extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);

            this.canvas.__engine.setHardwareScalingLevel(0.25/ window.devicePixelRatio);

            await crs.call("gfx_sdf_icon", "add", { element: this.canvas, shader: "sdf", atlas: "statuses", glyph: "approved", position: {x: -2}, color: "#ff0000", scale: 0.25}).catch(e => console.error(e));
            await crs.call("gfx_sdf_icon", "add", { element: this.canvas, shader: "sdf", atlas: "statuses", glyph: "cancel", position: {x: -1}, color: "#00ff00", scale: 0.5});
            await crs.call("gfx_sdf_icon", "add", { element: this.canvas, shader: "sdf", atlas: "statuses", glyph: "check-circle", position: {x: 0}, color: "#0000ff", scale: 1.0});
            await crs.call("gfx_sdf_icon", "add", { element: this.canvas, shader: "sdf", atlas: "statuses", glyph: "clock", position: {x: 1}, scale: 1.25});
            await crs.call("gfx_sdf_icon", "add", { element: this.canvas, shader: "sdf", atlas: "statuses", glyph: "minus-circle", position: {x: 2.5}, scale: 1.5 });
        }

        if (this.canvas.dataset.ready == "true") {
            await ready();
        }
        else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";


export default class Text extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            await crs.call("gfx_grid", "add", { element: this.canvas });
            await crs.call("gfx_text", "add", { element: this.canvas, text: "a" });
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
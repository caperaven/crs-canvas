import {ThemeManager} from "./managers/theme-manager.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"
import {TIMELINE_SCALE} from "./timeline_scale.js";

export class Timeline extends crsbinding.classes.BindableElement {

    get html() {
        return import.meta.url.replace(".js", ".html")
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.canvas = this.querySelector("canvas");
        await ThemeManager.initialize(this.canvas);
        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            await crs.call("gfx_timeline_header", "initialize", { element: this.canvas});

            await crs.call("gfx_timeline_header", "render", {
                start_date: new Date(2020,0, 1),
                end_date: new Date(2022,11, 31),
                scale: TIMELINE_SCALE.MONTH,
                element: this.canvas
            });

            await crs.call("gfx_timeline_rows", "initialize", { element: this.canvas});

            await crs.call("gfx_timeline_rows", "render", {
                element: this.canvas
            });
        }

        if (this.canvas.dataset.ready == "true") {
            await ready();
        }
        else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {

    }


}

customElements.define("crs-timeline", Timeline)
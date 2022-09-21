import {ThemeManager} from "./managers/theme-manager.js";
import "./managers/header-manager.js"
import "./managers/row-manager.js"
import "./../../src/managers/timeline-manager.js";

import {TIMELINE_SCALE} from "./timeline_scale.js";
import {workOrderSamples} from "../../app/timeline/sample_data.js";

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
            await this.render();
        }

        if (this.canvas.dataset.ready == "true") {
            await ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {

    }


    async render() {
        const startDate = new Date(2022, 0, 1);
        const endDate = new Date(2022, 11, 31);

        await crs.call("time_line", "initialize", {
            element: this.canvas,
            min: startDate,
            max: endDate
        });

        await crs.call("gfx_timeline_header", "initialize", {element: this.canvas});

        await crs.call("gfx_timeline_header", "render", {
            start_date: startDate,
            end_date: endDate,
            scale: TIMELINE_SCALE.MONTH,
            element: this.canvas
        });

        await crs.call("gfx_timeline_rows", "initialize", {element: this.canvas});

        await crs.call("gfx_timeline_rows", "render", {
            element: this.canvas,
            items: workOrderSamples
        });
    }

}

customElements.define("crs-timeline", Timeline)
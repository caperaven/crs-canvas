export class Canvas extends HTMLCanvasElement {
    async connectedCallback() {
        const camera = this.dataset.camera || "free,0,5,-10";
        await crs.call("gfx", "initialize", { element: this, camera: camera });
        await crs.call("dom", "notify_ready", {element: this});
    }

    async disconnectedCallback() {
        await crs.call("gfx", "dispose", { element: this });
    }
}

customElements.define("canvas-2d", Canvas, { extends: "canvas" })
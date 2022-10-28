import "./../../src/crs-canvas.js"

export class Canvas extends HTMLCanvasElement {
    async connectedCallback() {
        const camera = this.dataset.camera || "free,0,5,-10";
        const color = this.dataset.color;
        await crs.call("gfx", "initialize", { element: this, camera: camera, color: color });
        await crs.call("component", "notify_ready", {element: this});
    }

    async disconnectedCallback() {
        await crs.call("gfx", "dispose", { element: this });
    }
}

customElements.define("canvas-2d", Canvas, { extends: "canvas" })
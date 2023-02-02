import "./../../src/crs-canvas.js"

export class Canvas2d extends HTMLElement {
    #canvas = document.createElement("canvas");

    async connectedCallback() {
        this.appendChild(this.#canvas);
        const camera = this.dataset.camera || "free,0,5,-10";
        const color = this.dataset.color;
        await crs.call("gfx", "initialize", { element: this.#canvas, camera: camera, color: color });
        await crs.call("component", "notify_ready", {element: this.#canvas});
    }

    async disconnectedCallback() {
        await crs.call("gfx", "dispose", { element: this.#canvas });
        this.#canvas = null;
    }
}

customElements.define("canvas-2d", Canvas2d)
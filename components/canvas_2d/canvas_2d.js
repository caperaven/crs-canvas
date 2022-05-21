export class Canvas extends HTMLCanvasElement {
    async connectedCallback() {
        const camera = this.dataset.camtype || "free,0,5,-10";
        crs.call("gfx", "initialize", { element: this, camera: camera });

        this.dataset.ready = "true";
        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        crs.call("gfx", "dispose", { element: this });
    }
}

customElements.define("canvas-2d", Canvas, { extends: "canvas" })
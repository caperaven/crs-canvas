import {font} from "./../../src/msdf/font.js";
import {TextManager} from "../../src/managers/text-manager.js";
import "./../../src/managers/grid-manager.js";

export default class Text extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.scene = this.canvas.__engine.scenes[0];
            this.textManager = new TextManager(font);
            await crs.call("gfx_grid", "add", { element: this.canvas })
            await this.createPlane();
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

    async createPlane() {
        const data = this.textManager.getFaceVertexData("T");
        const customMesh = new BABYLON.Mesh("text", this.scene);
        data.applyToMesh(customMesh);

        customMesh.position = new BABYLON.Vector3(0, 0, 0);

        const material = new BABYLON.StandardMaterial("font", this.scene);
        material.emissiveTexture = new BABYLON.Texture("src/msdf/SourceSansPro-Regular.png");
        customMesh.material = material;
    }
}
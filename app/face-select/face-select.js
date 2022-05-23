import "./../../src/meshes/grid-box.js";

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        const canvas = this.element.querySelector("canvas");

        const ready = () => {
            canvas.removeEventListener("ready", ready);
            this.addMeshes(canvas);
        }

        if (canvas.dataset.ready == "true") {
            ready();
        }
        else {
            canvas.addEventListener("ready", ready);
        }
    }


    addMeshes(canvas) {
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), canvas.__layers[0]);
        light.intensity = 0.7;

        const box = BABYLON.MeshBuilder.CreateBox("grid", {size: 1}, canvas.__layers[0]);
        box.position.y = 1;
    }
}
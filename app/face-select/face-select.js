import "./../../src/meshes/grid-box.js";

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);
            this.addMeshes();
            this.addPickEvent();
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        }
        else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        this.canvas.__layers[0].onPointerDown = null;
    }


    addMeshes() {
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.canvas.__layers[0]);
        light.intensity = 0.7;

        BABYLON.MeshBuilder.CreateBox("grid", {size: 1}, this.canvas.__layers[0]);
    }

    addPickEvent() {
        this.canvas.__layers[0].onPointerDown = this.pointerDown.bind(this);
    }

    pointerDown(event, pickResult) {
        if (pickResult.hit == false) return;

        const normals = pickResult.getNormal(true, true);
        const point = pickResult.pickedMesh.position;

        const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, this.canvas.__layers[0]);
        box.position = point.add(normals);
    }
}
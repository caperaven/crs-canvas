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
        const cameraPosition = this.canvas.__camera.position;
        const light = new BABYLON.HemisphericLight("light", cameraPosition, this.canvas.__layers[0]);
        light.intensity = 0.7;

        BABYLON.MeshBuilder.CreateBox("grid", {size: 1}, this.canvas.__layers[0]);
    }

    addPickEvent() {
        this.canvas.__layers[0].onPointerDown = this.pointerDown.bind(this);
    }

    async pointerDown(event, pickResult) {
        if (event.button != 0 || pickResult.hit == false) return;

        if (event.ctrlKey == true) {
            return this.remove(event, pickResult)
        }
        else {
            return this.add(event, pickResult);
        }

    }

    async add(event, pickResult) {
        const normals = pickResult.getNormal(true, true);
        const point = pickResult.pickedMesh.position;

        const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, this.canvas.__layers[0]);
        box.position = point.add(normals);

        box.material = await crs.call("gfx_materials", "get", {
            element: this.canvas,
            value: "#ffffff",
            diffuse: true
        })
    }

    async remove(event, pickResult) {
        pickResult.pickedMesh.dispose();
    }
}
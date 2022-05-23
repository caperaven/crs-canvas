import "./../../src/meshes/grid-box.js";

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.currentColor = "#ffffff";
        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);
            this.addMeshes();
            this.addPickEvent();
            this.addGUI();
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

        this.createBox()
    }

    async createBox(position) {
        const box = BABYLON.MeshBuilder.CreateBox("grid", {size: 1}, this.canvas.__layers[0]);

        box.material = await crs.call("gfx_materials", "get", {
            element: this.canvas,
            value: this.currentColor,
            diffuse: true
        })

        if (position) {
            box.position = position;
        }
    }

    addPickEvent() {
        this.canvas.__layers[0].onPointerDown = this.pointerDown.bind(this);
    }

    async pointerDown(event, pickResult) {
        if (event.button != 0 || pickResult.hit == false) return;

        if (event.ctrlKey == true) {
            return this.remove(event, pickResult);
        }
        else if (event.altKey == true) {
            return this.changeColor(event, pickResult);
        }
        else {
            return this.add(event, pickResult);
        }

    }

    async add(event, pickResult) {
        const normals = pickResult.getNormal(true, true);
        const point = pickResult.pickedMesh.position;

        await this.createBox(point.add(normals));
    }

    async remove(event, pickResult) {
        pickResult.pickedMesh.dispose();
    }

    async changeColor(event, pickResult) {
        pickResult.pickedMesh.material = await crs.call("gfx_materials", "get", {
            element: this.canvas,
            value: this.currentColor,
            diffuse: true
        })
    }

    async addGUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const picker = new BABYLON.GUI.ColorPicker();
        picker.height = "200px";
        picker.width = "200px";
        picker.left = -50;
        picker.top = 50;
        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        picker.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        picker.onValueChangedObservable.add(value => {
            this.currentColor = value.toHexString();
            console.log(this.currentColor);
        });

        advancedTexture.addControl(picker);
    }
}
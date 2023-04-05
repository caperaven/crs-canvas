

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.currentColor = "#ffffff";
        this.canvas2d = this.element.querySelector("canvas-2d");
        const ready = () => {


            this.canvas2d.removeEventListener("ready", ready);
            this.canvas =  this.canvas2d.querySelector("canvas");
            this.addMeshes();
            this.addPickEvent();
            this.addGUI();
            this.addSave();
        }
        this.canvas2d.addEventListener("ready", ready);
    }

    async disconnectedCallback() {
        this.canvas.__layers[0].onPointerDown = null;
        this.colorPicker.onValueChangedObservable = null;

        this.element.removeEventListener("keydown", this.keyDownHandler);
        this.keyDownHandler = null;
    }


    addMeshes() {
        const cameraPosition = this.canvas.__camera.position;
        this.light = new BABYLON.HemisphericLight("light", cameraPosition, this.canvas.__layers[0]);
        this.light.intensity = 0.7;

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
        else if (event.shiftKey == true) {
            return this.pickColor(event, pickResult);
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

    async pickColor(event, pickResult) {
        this.currentColor = pickResult.pickedMesh.material.diffuseColor.toHexString();
        this.colorPicker.value = pickResult.pickedMesh.material.diffuseColor;
    }

    async addGUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const color = await crs.call("gfx_materials", "get", {
            element: this.canvas,
            value: "#ffffff",
            diffuse: true
        })

        const picker = new BABYLON.GUI.ColorPicker();
        picker.value = color.diffuseColor;
        picker.height = "200px";
        picker.width = "200px";
        picker.left = -50;
        picker.top = 50;
        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        picker.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        picker.onValueChangedObservable.add(value => {
            this.currentColor = value.toHexString();
        });

        advancedTexture.addControl(picker);
        this.colorPicker = picker;


        const slider = new BABYLON.GUI.Slider();
        slider.minimum = 0;
        slider.maximum = 1;
        slider.value = 0.7;
        slider.height = "20px";
        slider.width = "200px";
        slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        slider.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        slider.left = -50;
        slider.top = 25;

        slider.onValueChangedObservable.add(value => {
            this.light.intensity = value;
        });

        advancedTexture.addControl(slider);
    }

    async addSave() {
        this.keyDownHandler = this.keydown.bind(this);
        this.element.addEventListener("keydown", this.keyDownHandler);
    }

    async keydown(event) {
        if (event.ctrlKey == true && event.key == "s") {

        }
    }
}
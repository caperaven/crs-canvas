export default class Text extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.scene = this.canvas.__engine.scenes[0];
            await this.createGrid();
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

    async createGrid() {
        this.bgPlane = BABYLON.MeshBuilder.CreatePlane("plane", {
            size: 200,
            position: { z: -0.1 }
        }, this.canvas.__layers[0]);

        this.bgPlane.material = new BABYLON.GridMaterial("grid", this.canvas.__layers[0]);
        this.bgPlane.material.gridRatio = 0.1;
        this.bgPlane.material.mainColor = new BABYLON.Color3(1, 1, 1);
        this.bgPlane.material.lineColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        this.bgPlane.enablePointerMoveEvents = true;
        this.bgPlane.position.z = 0.01;
    }

    async createPlane() {
        const material = new BABYLON.StandardMaterial("myMaterial", this.scene);
        material.emissiveTexture = new BABYLON.Texture("/src/msdf/SourceSansPro-Regular.png", this.scene);

        const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
            width: 0.5,
            height: 0.7,
            position: { z: 0 }
        }, this.canvas.__layers[0]);

        plane.material = material;
    }
}
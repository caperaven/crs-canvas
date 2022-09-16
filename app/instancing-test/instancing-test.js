export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.currentColor = "#ffffff";
        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);

           this.addMeshes();
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    addMeshes() {
        const scene = this.canvas.__layers[0];

        const data = new BABYLON.VertexData()

        data.positions = [
            0, 0, 0,
            10, 0, 0,
            10, 1, 0,
            9, 2, 0,
            8, 1, 0,
            2, 1, 0,
            1, 2, 0,
            0, 1, 0
        ]

        data.indices = [
            0, 1, 2,
            2, 3, 4,
            2, 7, 0,
            5, 6, 7
        ]

        const customMesh = new BABYLON.Mesh("custom", scene);
        data.applyToMesh(customMesh);

        const material = new BABYLON.StandardMaterial("material", scene);
        customMesh.material = material;


        material.diffuseColor = new BABYLON.Color3(1, 0, 1);

        // const plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 0.5}, scene);




        let instances = [];

        for (let i = 0; i < 500000; i++) {
            const matrix = BABYLON.Matrix.Translation(i*12, 0, 0);
            instances.push(matrix);
        }

        customMesh.thinInstanceAdd(instances);
    }
}
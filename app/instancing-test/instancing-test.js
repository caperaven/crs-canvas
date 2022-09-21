import "./../../src/managers/grid-manager.js";

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.currentColor = "#ffffff";
        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            await crs.call("gfx_grid", "add", {element: this.canvas});
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

        const material = new BABYLON.StandardMaterial("material", scene);
        material.emissiveColor = new BABYLON.Color3(255, 0, 0)



        material.diffuseColor = new BABYLON.Color3(1, 0, 1);

        const plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1}, scene);
        plane.position.set(0.5,-0.5,0)
        plane.material = material;


        const customMesh = new BABYLON.Mesh("custom", scene);
        data.applyToMesh(customMesh);
        customMesh.material = material;

        let instances = [];

        for (let i = 0; i < 100; i++) {
            const matrix = BABYLON.Matrix.Translation(i * 12, 0, 0);
            instances.push(matrix);
        }

        customMesh.thinInstanceAdd(instances);
    }
}
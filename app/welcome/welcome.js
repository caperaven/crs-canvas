import "./../../src/meshes/grid-box.js";
import "./../../src/meshes/custom-geometry.js";

export default class Welcome extends crsbinding.classes.ViewBase {
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
        light.intensity = 1;

        // const box = BABYLON.MeshBuilder.CreateGridBox("grid", {size: 16, ratio: 1}, canvas.__layers[0]);
        // box.position.y = 2.5;
        // BABYLON.MeshBuilder.CreateBox("box", {size: 1}, canvas.__layers[0]);

        BABYLON.MeshBuilder.CreateGeometry("custom", {data: "icons/home", position: {x: -1, y: 1}}, canvas.__layers[0]);
        BABYLON.MeshBuilder.CreateGeometry("custom", {data: "flowchart/documents", position: {x: 1, y: 1}}, canvas.__layers[0]);
        BABYLON.MeshBuilder.CreateGeometry("custom", {data: "floorplan/fire_hose", position: {x: 1, y: -1}}, canvas.__layers[0]);
    }
}
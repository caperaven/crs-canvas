import "./../../src/meshes/grid-box.js";

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
        canvas.__layers[0].onPointerDown = (event, pickResult) => {
            console.log(pickResult.pickedMesh)
        }

        // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), canvas.__layers[0]);
        // light.intensity = 1;

        // const box = BABYLON.MeshBuilder.CreateGridBox("grid", {size: 16, ratio: 1}, canvas.__layers[0]);
        // box.position.y = 2.5;
        // BABYLON.MeshBuilder.CreateBox("box", {size: 1}, canvas.__layers[0]);

        crs.call("gfx_geometry", "add", { element: canvas, data: "icons/home", position: {x: -1, y: 1}, color: "#ff0090" });
        crs.call("gfx_geometry", "add", { element: canvas, data: "flowchart/documents", position: {x: 1, y: 1}, color: "#ff9000" });
        crs.call("gfx_geometry", "add", { element: canvas, data: "floorplan/fire_hose", position: {x: 1, y: -1}, color: "#9000ff" });
    }
}
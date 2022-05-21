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
        light.intensity = 0.7;

        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, canvas.__layers[0]);
        sphere.position.y = 1;

        BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, canvas.__layers[0]);
    }
}
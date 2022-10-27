import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";

export default class Text extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(0.5/ window.devicePixelRatio);
            this.canvas.__layers[0].clearColor = new BABYLON.Color3(1, 1, 1);
            //await crs.call("gfx_grid", "add", { element: this.canvas, attributes: [{ fn: "Float", name: "min", value: 0.1 }] });
            await crs.call("gfx_text", "add", { element: this.canvas, bold: true, text: "Hello World", position: {y: 0.5}, attributes: [
                {
                    fn: "Array3",
                    name: "color",
                    value: [1, 0, 0]
                },
                {
                    fn: "Float",
                    name: "min",
                    value: 0.2
                },
                {
                    fn: "Float",
                    name: "max",
                    value: 0.5
                }
            ]});
            await crs.call("gfx_text", "add", { element: this.canvas, text: "hello world", position: {x: 0.25, y: 0.05}, attributes: [
                {
                    fn: "Array3",
                    name: "color",
                    value: [0, 0, 1]
                },
                {
                    fn: "Float",
                    name: "min",
                    value: 0.2
                },
                {
                    fn: "Float",
                    name: "max",
                    value: 0.5
                }
            ]});

            await crs.call("gfx_icons", "add", {
                element: this.canvas,
                icon: "59650",
                position: {x: -2},
                attributes: [
                    {
                        fn: "Array3",
                        name: "color",
                        value: [0, 0, 1]
                    },
                    {
                        fn: "Float",
                        name: "min",
                        value: 0.2
                    },
                    {
                        fn: "Float",
                        name: "max",
                        value: 0.5
                    }
                ]
            }).catch(e => console.error(e));
        }

        if (this.canvas.dataset.ready == "true") {
            await ready();
        }
        else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    preLoad() {
        this.setProperty("min", 0.01);
        this.setProperty("max", 1.0);
    }

    async minChanged(newValue) {
        this.canvas?.__layers[0].meshes[0].material.setFloat("min", newValue);
        this.canvas?.__layers[0].meshes[1].material.setFloat("min", newValue);
        this.canvas?.__layers[0].meshes[2].material.setFloat("min", newValue);
    }

    async maxChanged(newValue) {
        this.canvas?.__layers[0].meshes[0].material.setFloat("max", newValue);
        this.canvas?.__layers[0].meshes[1].material.setFloat("max", newValue);
        this.canvas?.__layers[0].meshes[2].material.setFloat("min", newValue);
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
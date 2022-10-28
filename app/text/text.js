import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";
import "./../../src/managers/materials-manager.js";
import "./../../src/managers/mesh-factory-manager.js";

export default class Text extends crsbinding.classes.ViewBase {
    #centerMesh;
    #textMesh;
    #checked;

    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(0.5/ window.devicePixelRatio);
            this.canvas.__layers[0].clearColor = new BABYLON.Color3(1, 1, 1);

            await crs.call("gfx_text", "initialize", {element: this.canvas});

            const model = { code: "A11", description: "Description of A11"};
            const attributes = [
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
            const position = {x: 0, y: 0};

            const meshes = await crs.call("gfx_mesh_factory", "create", {
                element: this.canvas, mesh: {
                    name: "plane1", type: "plane", options: {
                        width: 1, height: 1
                    }
                }, material: {
                    id: "mat1", color: "#939393",
                }, positions: [{x: 0, y: 0, z: 0}]
            })

            this.#centerMesh = meshes[0];
            this.#textMesh = await crs.call("gfx_composite", "create_line", { element: this.canvas, template: "${code}: ${description}", parameters: model, position, attributes });

            // await crs.call("gfx_composite", "create_line", { element: this.canvas, template: "${code}: ${description}", parameters: model, position, attributes });

            // await crs.call("gfx_text", "add", { element: this.canvas, text: "hello world", position: {x: 0.25, y: 0.05}, attributes: [
            //     {
            //         fn: "Array3",
            //         name: "color",
            //         value: [0, 0, 1]
            //     },
            //     {
            //         fn: "Float",
            //         name: "min",
            //         value: 0.2
            //     },
            //     {
            //         fn: "Float",
            //         name: "max",
            //         value: 0.5
            //     }
            // ]});

            // await crs.call("gfx_icons", "add", {
            //     element: this.canvas,
            //     icon: 97,
            //     position: {x: -2},
            //     attributes: [
            //         {
            //             fn: "Array3",
            //             name: "color",
            //             value: [0, 0, 1]
            //         },
            //         {
            //             fn: "Float",
            //             name: "min",
            //             value: 0.2
            //         },
            //         {
            //             fn: "Float",
            //             name: "max",
            //             value: 0.5
            //         }
            //     ]
            // }).catch(e => console.error(e));
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
        // this.canvas?.__layers[0].meshes[0].material.setFloat("min", newValue);
        this.canvas?.__layers[0].meshes[1].material.setFloat("min", newValue);
        // this.canvas?.__layers[0].meshes[2].material.setFloat("min", newValue);
    }

    async maxChanged(newValue) {
        // this.canvas?.__layers[0].meshes[0].material.setFloat("max", newValue);
        this.canvas?.__layers[0].meshes[1].material.setFloat("max", newValue);
        // this.canvas?.__layers[0].meshes[2].material.setFloat("max", newValue);
    }

    async checkedChanged(newValue) {
        this.#checked = newValue;
        //update text
    }

    async stateChange(newValue) {

    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
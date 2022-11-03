import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";
import "./../../src/managers/materials-manager.js";
import "./../../src/managers/mesh-factory-manager.js";
import "./../../src/managers/stats-manager.js";
import "./../../src/managers/mesh-position-manager.js";
import {getBounds} from "../../src/factory/composite-factory.js";

export default class Text extends crsbinding.classes.ViewBase {
    #centerMesh;
    #relativeMesh;
    #positions = Object.freeze({
        top: this.#top.bind(this),
        right: this.#right.bind(this),
        bottom: this.#bottom.bind(this),
        left: this.#left.bind(this),
    })

    get position() {
        return this.getProperty("position");
    }

    set position(newValue) {
        this.setProperty("position", newValue);

        if ((newValue == 'top' || newValue == 'bottom') && (this.anchor == 'top' || this.anchor == 'bottom')) {
            this.anchor = "left";
        }

        if ((newValue == 'left' || newValue == 'right') && (this.anchor == 'left' || this.anchor == 'right')) {
            this.anchor = "top";
        }
    }

    get anchor() {
        return this.getProperty("anchor");
    }

    set anchor(newValue) {
        this.setProperty("anchor", newValue);
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.position = "bottom";
        this.anchor = "left";

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(0.5/ window.devicePixelRatio);
            this.canvas.__layers[0].clearColor = new BABYLON.Color3(1, 1, 1);

            await crs.call("gfx_icons", "initialize", {element: this.canvas});
            await crs.call("gfx_text", "initialize", {element: this.canvas});
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
            const model = { code: "A11", description: "Description of A11"};

            //NOTE KR: Rabie's work
            // await crs.call("gfx_composite", "create", {
            //     element: this.canvas,
            //     templates: ['<icon style="color: #ff0080">98</icon> <bold style="color: #ff90ff">[${code}]</bold> <icon style="color: #ff0000">97</icon> <regular style="color: #00ff90">${description}</regular>'],
            //     parameters: model,
            //     position: {x: 0, y: 0}
            // })
            // model.code = "A12";
            // model.description = "Description of A12";
            // await crs.call("gfx_composite", "create", {
            //     element: this.canvas,
            //     templates: ['<icon style="color: #ff0000">98</icon> <bold style="color: #0098EE">[${code}]</bold> ${description}'],
            //     parameters: model,
            //     position: {x: 0, y: 1}
            // })
            // model.code = "A13";
            // model.description = "Description of A13";
            // await crs.call("gfx_composite", "create", {
            //     element: this.canvas,
            //     templates: ['<icon style="color: #00ff00">98</icon> <bold style="color: #ff0090">[${code}]</bold> ${description}'],
            //     parameters: model,
            //     position: {x: 0, y: 2}
            // })
            // model.code = "A14";
            // model.description = "Description of A14";
            // await crs.call("gfx_composite", "create", {
            //     element: this.canvas,
            //     templates: ['<icon style="color: #0000ff">98</icon> <bold style="color: #0098E0">[${code}]</bold> <regular style="color: #ffa07b">${description}</regular>'],
            //     parameters: model,
            //     position: {x: 0, y: 3}
            // })

            const meshes = await crs.call("gfx_mesh_factory", "create", {
                element: this.canvas, mesh: {
                    name: "plane1", type: "plane", options: {
                        width: 2, height: 2
                    }
                }, material: {
                    id: "mat1", color: "#939393",
                }, positions: [{x: 0, y: 0, z: 0}]
            })
            this.#centerMesh = meshes[0];

            this.#relativeMesh = await crs.call("gfx_text", "add", {
                element: this.canvas,
                text: "Hello World",
                position: {x: 0, y: 0},
                color: {r: 1, g: 0, b:0, a: 1},
                attributes: attributes
            })

            // await crs.call("gfx_mesh_position", "set_relative_position", {
            //     mesh: this.#relativeMesh,
            //     target: this.#centerMesh,
            //     at: this.position,
            //     margin: 0
            // })

            //NOTE KR: Need to figure out how to make relative placement work for composite
            // const mesh = await crs.call("gfx_composite", "create", {
            //     element: this.canvas,
            //     template: '<icon style="color: #ff0080">98</icon> <bold style="color: #0098E0">[${code}]</bold> ${description}',
            //     parameters: model,
            //     position: {x: 0, y: 3}
            // })
            //
            // console.log(mesh, getBounds(mesh));
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

    async setPosition(newValue) {
        this.position = newValue;
        await this.#positions[newValue]();
    }

    async setAnchor(newValue) {
        this.anchor = newValue;
        await this.#positions[this.position]();
    }

    async #top() {
        await crs.call("gfx_mesh_position", "set_relative_position", {
            mesh: this.#relativeMesh,
            target: this.#centerMesh,
            at: this.position,
            anchor: this.anchor || "left",
            margin: 0
        })
    }

    async #right() {
        await crs.call("gfx_mesh_position", "set_relative_position", {
            mesh: this.#relativeMesh,
            target: this.#centerMesh,
            at: this.position,
            anchor: this.anchor || "top",
            margin: 0
        })
    }

    async #bottom() {
        await crs.call("gfx_mesh_position", "set_relative_position", {
            mesh: this.#relativeMesh,
            target: this.#centerMesh,
            at: this.position,
            anchor: this.anchor || "left",
            margin: 0
        })
    }

    async #left() {
        await crs.call("gfx_mesh_position", "set_relative_position", {
            mesh: this.#relativeMesh,
            target: this.#centerMesh,
            at: this.position,
            anchor: this.anchor || "top",
            margin: 0
        })
    }

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.canvas
        });
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
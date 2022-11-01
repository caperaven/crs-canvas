import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";
import "./../../src/managers/stats-manager.js";
import "./../../src/managers/icons-manager.js";

export default class Text extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(0.5/ window.devicePixelRatio);
            this.canvas.__layers[0].clearColor = new BABYLON.Color3(1, 1, 1);

            await crs.call("gfx_icons", "initialize", {element: this.canvas});

            const model = { code: "A11", description: "Description of A11"};

            await crs.call("gfx_composite", "create_line", {
                element: this.canvas,
                template: '<icon style="color: #ff0080">98</icon> <bold style="color: #0098E0">[${code}]</bold> ${description}',
                parameters: model,
                position: {x: 0, y: 0}
            })

            model.code = "A12";
            model.description = "Description of A12";
            await crs.call("gfx_composite", "create_line", {
                element: this.canvas,
                template: '<icon style="color: #ff0080">98</icon> <bold style="color: #0098E0">[${code}]</bold> ${description}',
                parameters: model,
                position: {x: 0, y: 1}
            })

            model.code = "A13";
            model.description = "Description of A13";
            await crs.call("gfx_composite", "create_line", {
                element: this.canvas,
                template: '<icon style="color: #ff0080">98</icon> <bold style="color: #0098E0">[${code}]</bold> ${description}',
                parameters: model,
                position: {x: 0, y: 2}
            })

            model.code = "A14";
            model.description = "Description of A14";
            await crs.call("gfx_composite", "create_line", {
                element: this.canvas,
                template: '<icon style="color: #ff0080">98</icon> <bold style="color: #0098E0">[${code}]</bold> ${description}',
                parameters: model,
                position: {x: 0, y: 3}
            })
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

    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.canvas
        });
    }

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
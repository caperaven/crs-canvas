import "./../../src/factory/composite-factory.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
export default class SdfShapes extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        requestAnimationFrame(() => {
            this.canvas = this.element.querySelector("canvas");

            const ready = async () => {
                this.canvas.removeEventListener("ready", ready);
                this.canvas.__engine.setHardwareScalingLevel(0.25/ window.devicePixelRatio);

                await crs.call("gfx_text", "initialize", {element: this.canvas});
                await crs.call("gfx_icons", "initialize", {element: this.canvas});
                const model = { code: "A11", description: "Description of A11"};

                await crs.call("gfx_composite", "create", {
                    element: this.canvas,
                    templates: ['<icon style="color: #ff0080">settings-outline</icon> <bold style="color: #ff90ff">[${code}]</bold> <icon style="color: #ff0000">location-pin</icon> <regular style="color: #00ff90">${description}</regular>'],
                    parameters: model,
                    position: {x: 0, y: 0}
                });

                model.code = "A12";
                model.description = "Description of A12";
                await crs.call("gfx_composite", "create", {
                    element: this.canvas,
                    templates: ['<icon style="color: #ff0000">settings-outline</icon> <bold style="color: #0098EE">[${code}]</bold> ${description}'],
                    parameters: model,
                    position: {x: 0, y: 1}
                })
                model.code = "A13";
                model.description = "Description of A13";
                await crs.call("gfx_composite", "create", {
                    element: this.canvas,
                    templates: ['<icon style="color: #00ff00">settings-outline</icon> <bold style="color: #ff0090">[${code}]</bold> ${description}'],
                    parameters: model,
                    position: {x: 0, y: 2}
                })
                model.code = "A14";
                model.description = "Description of A14";
                await crs.call("gfx_composite", "create", {
                    element: this.canvas,
                    templates: ['<icon style="color: #0000ff">settings-outline</icon> <bold style="color: #0098E0">[${code}]</bold> <regular style="color: #ffa07b">${description}</regular>'],
                    parameters: model,
                    position: {x: 0, y: 3}
                })
            }

            this.canvas.addEventListener("ready", ready);
        });
    }

    async disconnectedCallback() {
        await crs.call("gfx_text", "dispose", {element: this.canvas});
        await crs.call("gfx_icons", "dispose", {element: this.canvas});
        this.canvas = null;
        await super.disconnectedCallback();
    }
}
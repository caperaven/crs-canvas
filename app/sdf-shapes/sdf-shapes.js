import "./../../src/managers/grid-manager.js";
import "./../../src/managers/icons-manager.js";

export default class SdfShapes extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = async () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(0.25/ window.devicePixelRatio);
            this.canvas.__layers[0].clearColor = new BABYLON.Color3(1, 1, 1);
            await crs.call("gfx_icons", "add", {
                element: this.canvas,
                icon: "59648",
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

    async disconnectedCallback() {
        await super.disconnectedCallback();
    }
}
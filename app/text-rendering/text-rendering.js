import {TextFactory} from "../../src/text/text-factory.js";
import "./../../src/managers/mesh-factory-manager.js"
import "./../../src/managers/grid-manager.js";

export default class TextRendering extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);
            this.canvas.__engine.setHardwareScalingLevel(1/ window.devicePixelRatio);
            this.addMeshes();
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        this.canvas.__layers[0].onPointerDown = null;
        this.canvas.__layers[0].pointerMove = null;
        this.canvas.__layers[0].pointerUp = null;
        this.bgPlane.dispose();
        this.bgPlane = null;
        this.canvas = null;
    }

    async addMeshes() {
        this.canvas.__layers[0].onPointerDown = this.pointerDown.bind(this);
        await this.createPlane()
    }

    async pointerDown(event, pickResult) {
        // console.log(event, pickResult);
    }

    async createPlane() {

        await crs.call("gfx_grid", "add", { element: this.canvas, attributes: [{ fn: "Float", name: "min", value: 0.1 }] });
        crs.call("gfx_mesh_factory", "create", {
            element: this.canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {width: 2.5, height: 1},
            },
            material: {
                id: "my_color",
                color: "#ff0090"
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        crs.call("gfx_mesh_factory", "create", {
            element: this.canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {width: 2.5, height: 1},
            },
            material: {
                id: "green",
                color: "#00ff00"
            },
            positions: [{x: 0, y: -2, z: 0}]
        })
    }



}


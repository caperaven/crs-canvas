import "../../src/meshes/grid-box.js";
import {TextFactory} from "../../src/text/text-factory.js";

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
        await this.createText()
    }

    async pointerDown(event, pickResult) {
        // console.log(event, pickResult);
    }

    async createPlane() {
        this.bgPlane = BABYLON.MeshBuilder.CreatePlane("plane", {
            size: 200,
            position: {z: -0.1}
        }, this.canvas.__layers[0]);
        this.bgPlane.material = new BABYLON.GridMaterial("grid", this.canvas.__layers[0]);
        this.bgPlane.material.gridRatio =1;
        this.bgPlane.material.mainColor = new BABYLON.Color3(1, 1, 1);
        this.bgPlane.material.lineColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        this.bgPlane.material.majorUnitFrequency = 5;
        this.bgPlane.enablePointerMoveEvents = true;
        this.bgPlane.position.z = 0.01;
    }

    async createText() {
        const factory = new TextFactory(this.canvas.__layers[0], () => {

            const dayMap = {
                0: "Mon",
                1: "Tue",
                2: "Wed",
                3: "Thu",
                4: "Fri",
                5: "Sat",
                6: "Sun"
            }

            let count = 0;
            for (let o = 0; o < 10; o++) {
                for (let i = 0; i < 10 *7; i+=7) {
                    for (let j = 0; j < 7; j++) {
                        const text = factory.create(dayMap[j], 0.3, new BABYLON.Color4(0, 0, 0), {x:  (i+j), y:-o})
                        count++;
                    }
                }
            }

            console.log(count * 3)
        });

    }
}


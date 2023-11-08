import "./../../src/managers/grid-manager.js";
import "./../../src/managers/text-manager.js";
import "./../../src/managers/icons-manager.js";
import "./../../src/factory/composite-factory.js";
import "./../../src/managers/materials-manager.js";
import "./../../src/managers/mesh-factory-manager.js";
import "./../../src/managers/stats-manager.js";
import "./../../src/managers/mesh-position-manager.js";
import {TextFactory} from "../../src/text/text-factory.js";
import "./../../src/managers/stats-manager.js";

export default class TextRendering extends crsbinding.classes.ViewBase {

    async connectedCallback() {
        await super.connectedCallback();

        const canvas = this.element.querySelector("canvas");

        const engine = canvas.__engine;


        requestAnimationFrame(async () => {


            await crs.call("gfx_text", "initialize", {element: canvas});

            console.log(canvas.__text);

            const scene = canvas.__layers[0];


            engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
            engine.adaptToDeviceRatio = true;

            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
            const mat = new BABYLON.StandardMaterial("mat");
            const texture = new BABYLON.Texture("https://assets.babylonjs.com/environments/numbers.jpg");
            mat.diffuseTexture = texture;

            var columns = 6;
            var rows = 1;

            const faceUV = new Array(6);

            for (let i = 0; i < 6; i++) {
                faceUV[i] = new BABYLON.Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
            }

            const options = {
                faceUV: faceUV,
                wrap: true
            };

            const box = BABYLON.MeshBuilder.CreateBox("box", options);
            box.material = mat;
            box.position.x = -2;

            const textMesh = await crs.call("gfx_text", "add", {
                element: canvas,
                text: "Hello World",
                position: {x: 0, y: 0},
                color: {r: 0, g: 0, b: 0, a: 1},
                attributes: [
                    {
                        fn: "Float",
                        name: "u_buffer",
                        value: 0.5
                    },
                    {
                        fn: "Float",
                        name: "u_edge",
                        value: 0.1
                    }
                ]
            });

            textMesh.scaling.x = 0.5
            textMesh.scaling.y = 0.5;


            // const factory = new TextFactory(scene, async () => {
            //
            //     const text = await factory.create("HelloWorld", 0.3, new BABYLON.Color4(0, 0, 0), {x: 0, y: 1})
            //     text.scaling.x =1;
            //     text.scaling.y = 1;
            // });

        });

    }


    async showInspector() {
        await crs.call("gfx_stats", "addInspector", {
            element: this.element.querySelector("canvas"),
        });
    }
}
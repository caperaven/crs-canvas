import "./managers/camera-manager.js"
import "./managers/materials-manager.js"
import "./managers/geometry-factory-manager.js"
import "./managers/instance-manager.js"
import "./managers/mesh-factory-manager.js"

class GraphicsActions {
    static async perform(step, context, process, item) {
        await this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const camera = await crs.process.getValue(step.args.camera)
        const color = await crs.process.getValue(step.args.color);

        const engine = new BABYLON.Engine(canvas);
        const scene  = new BABYLON.Scene(engine);

        if (color != null) {
            scene.clearColor = BABYLON.Color3.FromHexString(color);
        }

        canvas.__layers = [];
        canvas.__layers.push(scene);
        canvas.__engine = engine;

        await crs.call("gfx_camera", "initialize", { element: canvas, type: camera });
        await crs.call("gfx_materials", "initialize", { element: canvas });

        canvas.__renderLoop = renderLoop.bind(canvas);
        canvas.__engine.runRenderLoop(canvas.__renderLoop);

        canvas.__resize = resize.bind(canvas);

        window.addEventListener("resize", canvas.__resize);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        await crs.call("gfx_camera", "dispose", { element: canvas });
        await crs.call("gfx_materials", "dispose", { element: canvas });

        window.removeEventListener("resize", canvas.__resize);
        canvas.__resize = null;

        canvas.__engine.stopRenderLoop(canvas.__renderLoop);
        canvas.__renderLoop = null;

        for (const scene of canvas.__layers) {
            scene.dispose();
        }

        canvas.__engine.dispose();
        canvas.__engine = null;
        canvas.__layers = null;
    }
}

function renderLoop() {
    for (const scene of this.__layers) {
        scene.render();
    }
}

function resize() {
    this.__engine.resize();
}

crs.intent.gfx = GraphicsActions;
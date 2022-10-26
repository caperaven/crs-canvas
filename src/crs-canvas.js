import "./managers/camera-manager.js"
import "./managers/materials-manager.js"
import "./managers/conditional-material-manager.js"
import "./managers/instance-manager.js"
import "./managers/sdf-glyphs-manager.js"
import "./managers/theme-manager.js"
import "./factory/timeline-shape-factory.js"

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

        scene.clearColor = BABYLON.Color3.FromHexString(color || "#FFFFFF");
        scene.getAnimationRatio();
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        scene.blockMaterialDirtyMechanism = true;

        canvas.__layers = [];
        canvas.__layers.push(scene);
        canvas.__engine = engine;

        await crs.call("gfx_materials", "initialize", { element: canvas });
        await crs.call("gfx_conditional_materials", "initialize", { element: canvas });
        await crs.call("gfx_camera", "initialize", { element: canvas, type: camera });
        await crs.call("gfx_sdf_icon", "initialize", { element: canvas });
        await crs.call("gfx_theme", "initialize", { element: canvas });

        canvas.__renderLoop = renderLoop.bind(canvas);
        canvas.__engine.runRenderLoop(canvas.__renderLoop);

        canvas.__resize = resize.bind(canvas);

        window.addEventListener("resize", canvas.__resize);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__engine.stopRenderLoop(canvas.__renderLoop);
        canvas.__renderLoop = null;

        window.removeEventListener("resize", canvas.__resize);
        canvas.__resize = null;

        for (const scene of canvas.__layers) {
            scene.dispose();
        }

        await crs.call("gfx_camera", "dispose", { element: canvas });
        await crs.call("gfx_materials", "dispose", { element: canvas });
        await crs.call("gfx_sdf_icon", "dispose", { element: canvas });
        await crs.call("gfx_conditional_materials", "dispose", { element: canvas });
        await crs.call("gfx_theme", "dispose", { element: canvas });

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
crs.intent.gfx.assetsLocation = "/assets";
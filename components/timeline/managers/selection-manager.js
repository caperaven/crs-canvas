import {createRect} from "./timeline-helpers.js";

export class SelectionManager {
    #canvas;
    #mesh;
    #clickHandler;
    #selectionCallback;

    constructor(canvas, selectionCallback) {
        this.#canvas = canvas;
        this.#selectionCallback = selectionCallback;
        this.#clickHandler = this.#click.bind(this);
        canvas.addEventListener("click", this.#clickHandler);
        canvas.addEventListener("contextmenu", this.#clickHandler);
    }

    dispose() {
        this.#canvas.removeEventListener("click",this.#clickHandler);
        this.#canvas.removeEventListener("contextmenu",this.#clickHandler);
        this.#clickHandler = null;
        this.#clickHandler = null;
        this.#mesh = this.#mesh.dispose();
        this.#canvas = null;
        this.#selectionCallback = null;
    }

    async init() {
        this.#mesh = await createRect("selection-plane",  this.#canvas._theme.row_selection, 0, 999, this.#canvas.__zIndices.selectionMesh, 999999, this.#canvas.__rowSize,  this.#canvas, false);
        this.#mesh.enableEdgesRendering();
        this.#mesh.edgesWidth = 1.0;
        this.#mesh.edgesColor = BABYLON.Color4.FromHexString( this.#canvas._theme.row_selection_border)
    }

    async hide() {
        this.#mesh.position.y = 999 // We need to remove this when selection is recalc on scale change
    }

    async #click(event) {
        let offset = 0; // TODO Change this to use canvas y offset

        const engine = this.#canvas.__engine;
        const scene = this.#canvas.__layers[0];
        const screenPosition = new BABYLON.Vector3(scene.pointerX, scene.pointerY, 1);
        const vector = BABYLON.Vector3.Unproject(
            screenPosition,
            engine.getRenderWidth(),
            engine.getRenderHeight(),
            BABYLON.Matrix.Identity(),
            scene.getViewMatrix(),
            scene.getProjectionMatrix()
        );

        this.#mesh.position.y =  Math.ceil(vector.y) - offset;
        this.#selectionCallback(event, (Math.ceil(vector.y)/-1)-1);
    }
}
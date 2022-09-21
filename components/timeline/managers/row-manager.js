import  "../../../src/managers/mesh-factory-manager.js";

class RowManager {
    constructor() {
        this.headers = [];
    }

    dispose() {
        this.headers = null;
        this.bgMesh?.dispose();
        this.bgMesh = null;
    }

    async render( canvas, scene,  ) {

        // For now hardcoding to days

        const itemCount = 100000;

        const rowMesh = await this._createMesh(1000, 1,canvas);

        const bufferMatrices = new Float32Array(16 * itemCount);
        const bufferColors = new Float32Array(4 * itemCount);

        let colors = [];
        //TODO only add every second row
        for (let i = 0; i < itemCount; i++) {
            const matrix = BABYLON.Matrix.Translation(0, -i, 0);
            matrix.copyToArray(bufferMatrices, i*16);

            if(i % 2) {
                //TODO find better way to add to array
                colors.push(...[0.933,0.933,0.933,1]);
            }
            else {
                colors.push(...[1,1,1,1]);
            }
        }

        bufferColors.set(colors);
        rowMesh.thinInstanceSetBuffer("matrix", bufferMatrices);
        rowMesh.thinInstanceSetBuffer("color", bufferColors, 4);


       // const idx = headerMesh.thinInstanceAdd(this.headers);
       // console.log(idx);
    }

    async _createMesh(width, height, canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "timeline_row",
                type: "plane",
                options: {
                    width: width,
                    height: height
                }
            },
            material: {
                id: "timeline_row",
                color: canvas._theme.header_bg,
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        return meshes[0];
    }

}

export class RowManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__headers = new RowManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__headers = canvas.__headers?.dispose();
    }

    static async render(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        canvas.__headers.render(canvas, scene);
    }
}


crs.intent.gfx_timeline_rows = RowManagerActions;
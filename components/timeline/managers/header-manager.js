import {TIMELINE_SCALE} from "../timeline_scale.js";
import  "../../../src/managers/mesh-factory-manager.js";

class HeaderManager {
    constructor() {
        this.headers = [];
    }

    dispose() {
        this.headers = null;
        this.bgMesh?.dispose();
        this.bgMesh = null;
    }

    async render(startDate, endDate, scale, canvas, scene,  ) {
        scale = scale || TIMELINE_SCALE.MONTH;

        // For now hardcoding to days

        const dayCount = getDaysBetweenDates(startDate, endDate);
        this.bgMesh = await this._createBgMesh(canvas, dayCount);
        const headerMesh = await this._createMesh(canvas);

        const bufferMatrices = new Float32Array(16 * dayCount);
        const bufferColors = new Float32Array(4 * dayCount);

        let colors = [];
        for (let i = 0; i < dayCount; i++) {

            startDate.setUTCDate(startDate.getUTCDate() + 1);

            const matrix = BABYLON.Matrix.Translation(i, 0, 0);

            matrix.copyToArray(bufferMatrices, i*16);
            const dayNumber = startDate.getUTCDay();

            if(dayNumber % 6 === 0 ||  dayNumber % 7 === 0) {
                //TODO find better way to add to array
               colors.push(...[0.933,0.933,0.933,1]);
            }
            else {
                colors.push(...[1,1,1,1]);
            }
        }

        console.log(bufferMatrices);
        console.log(bufferColors);
        bufferColors.set(colors);
        headerMesh.thinInstanceSetBuffer("matrix", bufferMatrices);
        headerMesh.thinInstanceSetBuffer("color", bufferColors, 4);


       // const idx = headerMesh.thinInstanceAdd(this.headers);
       // console.log(idx);
    }

    async _createMesh(canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "timeline_header",
                type: "plane",
                options: {
                    width: 0.98,
                    height: 0.48
                }
            },
            material: {
                id: "timeline_header",
                color: canvas._theme.header_bg,
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        return meshes[0];
    }

    async _createBgMesh(canvas, size){
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "timeline_header_border",
                type: "plane",
                options: {
                    width: size,
                    height: 0.5
                }
            },
            material: {
                id: "timeline_header_border",
                color: canvas._theme.header_border,
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        return meshes[0];
    }
}

export class HeaderManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__headers = new HeaderManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__headers = canvas.__headers?.dispose();
    }

    static async render(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const startDate = await crs.process.getValue(step.args.start_date, context, process, item);
        const endDate = await crs.process.getValue(step.args.end_date, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        canvas.__headers.render(startDate, endDate, scale, canvas, scene);
    }
}

function getDaysBetweenDates(firstDate, secondDate) {
    // This function can be removed when Kieran got the timeline manager going
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return diffDays;
}

crs.intent.gfx_timeline_header = HeaderManagerActions;
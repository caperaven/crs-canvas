import "../../../src/managers/mesh-factory-manager.js";
import {TIMELINE_SCALE} from "../timeline_scale.js";

class RowManager {

    async render(items, canvas) {
        // For now hardcoding to days

        const itemCount = items.length;

        await this._createOffsetRows(itemCount, canvas);

        const range1Mesh = await this._createRect(1,0.5,canvas);
        const range1Matrices = new Float32Array(16 * itemCount);

        const headerOffset = 1;


        const scaleVector = new BABYLON.Vector3(0, 1, 1);
        const rotation = new BABYLON.Quaternion.RotationYawPitchRoll(0, 0, 0);
        const transformVector = new BABYLON.Vector3(0, 0, 0);
        for (let i = 0; i < itemCount; i++) {
            const item = items[i]

            item.testDate = stringDateToDate(item.receivedOn);

            const result = await crs.call("time_line", "get", {
                element: canvas,
                start: stringDateToDate(item.receivedOn),
                end: stringDateToDate(item.requiredBy),
                scale: TIMELINE_SCALE.MONTH
            });


            const y = -i - headerOffset;

            const width = Math.abs(result.x2 - result.x1);

            const x = result.x1 + ((result.x2 - result.x1) / 2);

            scaleVector.x = width;

            transformVector.set(x,y,0);

            const newMat = BABYLON.Matrix.Compose(scaleVector, rotation, transformVector);

            newMat.copyToArray(range1Matrices, i * 16);

        }

        range1Mesh.thinInstanceSetBuffer("matrix", range1Matrices);
    }

    async _createOffsetRows(itemCount, canvas) {
        const offsetRowMesh = await this._createMesh(1000, 1, canvas);
        const offsetRowCount = Math.round(itemCount / 2);
        const rowOffsetMatrices = new Float32Array(16 * offsetRowCount);
        const rowOffsetColors = new Float32Array(4 * offsetRowCount);

        let colors = [];

        // Render offset row instances
        const headerOffset = 1;
        for (let i = 0; i < offsetRowCount; i++) {
            const y = -i - headerOffset;

            const matrix = BABYLON.Matrix.Translation(0, y*2, 0);
            matrix.copyToArray(rowOffsetMatrices, i * 16);
            colors.push(...[0.976, 0.976, 0.976, 1]);
        }

        rowOffsetColors.set(colors);
        offsetRowMesh.thinInstanceSetBuffer("matrix", rowOffsetMatrices);
        offsetRowMesh.thinInstanceSetBuffer("color", rowOffsetColors, 4);

    }

    async _createRect(width, height, canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "timeline_row_range1",
                type: "plane",
                options: {
                    width: width,
                    height: height
                }
            },
            material: {
                id: "timeline_row_range1",
                color: canvas._theme.row_range1,
            },
            positions: [{x: 0, y: 0, z: 0}]
        })

        return meshes[0];
    }

    async _createMesh(width, height, canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                id: "timeline_offset_row_bg",
                type: "plane",
                options: {
                    width: width,
                    height: height
                }
            },
            material: {
                id: "timeline_row",
                color: canvas._theme.offset_row_bg,
            },
            positions: [{x: width / 2, y: 0, z: 0}]
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
        canvas.__rows = new RowManager();
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__rows = canvas.__rows?.dispose();
    }

    static async render(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const items = await crs.process.getValue(step.args.items, context, process, item);
        const scene = canvas.__layers[layer];

        canvas.__rows.render(items, canvas, scene);
    }
}

function stringDateToDate(stringDate) {
    const parts = stringDate.split(" ");
    const date = parts[0].split("/").reverse().join("-");
    const fullString = [date, parts[1]].join("T");
    return new Date(Date.parse(fullString));
}

crs.intent.gfx_timeline_rows = RowManagerActions;
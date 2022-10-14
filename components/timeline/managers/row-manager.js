import "../../../src/managers/mesh-factory-manager.js";
import {TIMELINE_SCALE} from "../timeline_scale.js";
import {Virtualization} from "./virtualization.js";

class RowManager {
    #configuration;

    constructor(config) {
        this.#configuration = config;
    }

    dispose() {
        this.#configuration = null;
    }

    clean(canvas, scene) {
        const offsetRowMesh = scene.getMeshByID('timeline_offset_row_bg');
        offsetRowMesh?.dispose();

        const rowData = scene.getMeshByID('timeline_row_range1');
        rowData?.dispose();
    }

    async render(items, canvas, scene, startDate, endDate, scale) {
        const itemCount = items.length;

        const result = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            min: startDate,
            max: endDate,
            scale: scale
        });
        await this._createOffsetRows(itemCount, canvas, result.totalWidth);

        const range1Mesh = await this._createRect(1,0.5, canvas);
        const range1Matrices = new Float32Array(16 * itemCount);

        const headerOffset = 1;

        const scaleVector = new BABYLON.Vector3(0, 1, 1);
        const rotation = new BABYLON.Quaternion.RotationYawPitchRoll(0, 0, 0);
        const transformVector = new BABYLON.Vector3(0, 0, 0);
        for (let i = 0; i < itemCount; i++) {
            const item = items[i]
            const result = await crs.call("gfx_timeline_manager", "get", {
                element: canvas,
                start: item.receivedOn,
                end: item.requiredBy,
                scale: scale
            });

            scaleVector.x = result.width;

            const x = result.x;
            const y = -i - headerOffset;
            transformVector.set(x,y,0);

            const newMat = BABYLON.Matrix.Compose(scaleVector, rotation, transformVector);

            newMat.copyToArray(range1Matrices, i * 16);

        }
        range1Mesh.thinInstanceSetBuffer("matrix", range1Matrices);


        const virtualization = new Virtualization(canvas, canvas.__camera, 0.5, items);
    }

    async _createOffsetRows(itemCount, canvas, width) {
        const offsetRowMesh = await this._createMesh(width, 1, canvas);
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
                name: "timeline_row_range1",
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
                name: "timeline_offset_row_bg",
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
        const config = await crs.process.getValue(step.args.config, context, process, item);
        canvas.__rows = new RowManager(config);
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas.__rows = canvas.__rows?.dispose();
    }

    static async clean(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        await canvas.__rows.clean(canvas, scene, scale);
    }

    static async render(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const items = await crs.process.getValue(step.args.items, context, process, item);
        const startDate = await crs.process.getValue(step.args.start_date, context, process, item);
        const endDate = await crs.process.getValue(step.args.end_date, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);

        const scene = canvas.__layers[layer];

        canvas.__rows.render(items, canvas, scene, startDate, endDate, scale);
    }
}

crs.intent.gfx_timeline_rows = RowManagerActions;
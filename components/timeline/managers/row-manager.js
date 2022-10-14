import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/geometry-factory-manager.js";
import {TIMELINE_SCALE} from "../timeline_scale.js";
import {Virtualization} from "./virtualization.js";

class RowManager {
    #configuration;
    #shapeConfig = Object.freeze({
        "pillar": {
            barHeight:  0.4,
            triangleHeight: 0.1,
            triangleWidth: 0.1,
            theme: "row_range1",
            yOffset: 0.15,
            zOffset: -0.001
        },
        "range_indicator": {
            barHeight: 0.05,
            triangleHeight: 0.1,
            triangleWidth: 0.2,
            theme: "row_range3",
            yOffset: 0.35,
            zOffset: 0
        },
        "rect": {
            barHeight: 0.3,
            triangleHeight: null,
            triangleWidth: null,
            theme: "row_range2",
            yOffset: 0.0075,
            zOffset: -0.002
        }
    })

    constructor(config) {
        this.#configuration = config;
    }

    dispose() {
        this.#configuration = null;
    }

    clean(canvas, scene) {
        const meshesToDispose = scene.rootNodes.map(node => {
            if (node.id.includes("range_item")) return node.id;
        });

        for (const id of meshesToDispose) {
            if (id == null) continue;
            const mesh = scene.getMeshByID(id);
            mesh.dispose();
        }
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

        for (let i = 0; i < itemCount; i++) {
            for (const settings of this.#configuration.settings) {
                const item = items[i];
                if (item[settings.fromField] == null || item[settings.toField] == null) continue;

                const result = await crs.call("gfx_timeline_manager", "get", {
                    element: canvas,
                    start: item[settings.fromField],
                    end: item[settings.toField],
                    scale: scale
                });

                let actual_geom = await crs.call("gfx_timeline_shape_factory", settings.shapeType, {
                    aabb: {
                        minX: result.x1,
                        minY: (-i - 1) - this.#shapeConfig[settings.shapeType]?.yOffset,
                        maxX: result.x2,
                        maxY: ((-i - 1) - this.#shapeConfig[settings.shapeType]?.yOffset) - (this.#shapeConfig[settings.shapeType]?.barHeight / 2)
                    },
                    triangle_height: this.#shapeConfig[settings.shapeType]?.triangleHeight,
                    triangle_width: this.#shapeConfig[settings.shapeType]?.triangleWidth,
                    bar_height: this.#shapeConfig[settings.shapeType]?.barHeight
                });

                const mesh = await crs.call("gfx_geometry", "from", {
                    element: canvas,
                    data: {
                        positions: actual_geom.vertices,
                        indices: actual_geom.indices
                    },
                    name: `range_item_${settings.shapeType}_${i}`,
                    position: {x: 0, y: 0, z: [this.#shapeConfig[settings.shapeType]?.zOffset]},
                    material: {
                        id: `${settings.shapeType}_${i}_mat`,
                        color: canvas._theme[this.#shapeConfig[settings.shapeType]?.theme]
                    }
                });
            }
        }


        const addCallback = async (item)=> {
            const meshes = await crs.call("gfx_mesh_factory", "create", {
                element: canvas,
                mesh: {
                    id: `${item.dataIndex}_my_mesh`,
                    type: "plane",
                    options: {
                        width: Math.random() * (3 - 1) + 1,
                        height: item.size - 0.05
                    },
                },
                material: {
                    id: "my_colo2r",
                    color: "#0000ff"
                },
                positions: [{x: 2, y: item.position / -1 - (item.size / 2), z: 0}]
            })

            return meshes[0];
        }

        const removeCallback = (mesh)=> {
            mesh.dispose();
        }

        const virtualization = new Virtualization(canvas, canvas.__camera, 0.5, items, addCallback, removeCallback);
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
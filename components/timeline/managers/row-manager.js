import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/geometry-factory-manager.js";
import "../../../src/factory/timeline-shape-factory.js"
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {Virtualization} from "./virtualization.js";

/**
 * This class is responsible for rendering the rows and includes generating the geometry and virtualization
 */
class RowManager {
    #configuration;
    #virtualization;
    #shapeConfig = Object.freeze({
        "pillar": {
            barHeight: 0.4,
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
        this.#virtualization = this.#virtualization.dispose();
        this.#shapeConfig = null;
    }

    /**
     * This cleans up meshes when swapping between timeline views such as day / week ...
     * @param canvas
     * @param scene
     */
    clean(canvas, scene) {
        const meshesToDispose = scene.rootNodes.map(node => {
            if (node.id.includes("range_item")) return node.id;
        });

        for (const id of meshesToDispose) {
            const mesh = scene.getMeshByID(id);
            mesh.dispose();
        }

        const offsetRowsMesh = scene.getMeshByID("timeline_offset_row_bg");
        offsetRowsMesh.dispose();
        this.#virtualization.clean();
    }

    /**
     * This draws the rows based on the data you have given.
     * THis is called at startup and then virtualization will take over.
     */
    async render(items, canvas, scene, startDate, endDate, scale, forceRender) {
        const itemCount = items.length;

        const result = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            min: startDate,
            max: endDate,
            scale: scale
        });
        await this.#createOffsetRows(itemCount, canvas, result.totalWidth, scale);
        await this.#initVirtualization(canvas, items, scale, forceRender);
    }

    /**
     * Start the virtualization process.
     */
    async #initVirtualization(canvas, items, scale) {
        const addCallback = async (sizeItem) => {
            const item = items[sizeItem.dataIndex];

            let shapes = [];
            for (const shape of this.#configuration.shapes) {
                if (item[shape.fromField] == null || item[shape.toField] == null || item[shape.fromField] == item[shape.toField] || item[shape.fromField] > item[shape.toField]) continue;
                shapes.push(await this.#drawShape(canvas, shape, item, sizeItem, scale));
            }

            const numberOfRows = this.#configuration.records.length;
            // NOTE KR: we can create a variable text size dependent on the number of text rows we're looking to render within a row
            // const sizeOfRow = sizeItem.size;
            // const textSize = (sizeOfRow / numberOfRows) - 0.1;
            // let yOffset = -textSize * numberOfRows;
            let yOffset = (0.25 / 2) * numberOfRows;
            for (const line of this.#configuration.records) {
                shapes.push(await this.#getText(canvas, line, null, item, sizeItem, yOffset, scale));
                yOffset -= 0.25;
            }

            return shapes;
        }

        const removeCallback = (shapes) => {
            for (const shape of shapes) {
                if (shape.material.name.includes("text_")) continue; //NOTE KR: to discuss with GM
                shape.dispose();
            }
        }

        const cleanCallback = (items) => {
            for (const shapes of items) {
                for (const shape of shapes) {
                    shape.dispose();
                }
            }
        }

        this.#virtualization = new Virtualization(canvas, canvas.__camera, 1, items, addCallback, removeCallback, cleanCallback);
        await this.#virtualization.init();

    }

    /**
     * This generates the geometry and returns the mesh to draw.
     */
    async #drawShape(canvas, shape, item, sizeItem, scale) {
        const rowOffset = scale !== TIMELINE_SCALE.YEAR ? 1.75 : 1;

        const result = await crs.call("gfx_timeline_manager", "get", {
            element: canvas,
            start: item[shape.fromField],
            end: item[shape.toField],
            scale: scale
        });

        item.actual_geom ||= {};
        item.actual_geom[shape.shapeType] ||= await crs.call("gfx_timeline_shape_factory", shape.shapeType, {
            aabb: {
                minX: result.x1,
                minY: (-sizeItem.position - rowOffset) - this.#shapeConfig[shape.shapeType]?.yOffset,
                maxX: result.x2,
                maxY: ((-sizeItem.position - rowOffset) - this.#shapeConfig[shape.shapeType]?.yOffset) - (this.#shapeConfig[shape.shapeType]?.barHeight / 2)
            },
            triangle_height: this.#shapeConfig[shape.shapeType]?.triangleHeight,
            triangle_width: this.#shapeConfig[shape.shapeType]?.triangleWidth,
            bar_height: this.#shapeConfig[shape.shapeType]?.barHeight
        });

        const args = {
            element: canvas,
            data: {
                positions: item.actual_geom[shape.shapeType].vertices,
                indices: item.actual_geom[shape.shapeType].indices
            },
            name: `range_item_${shape.shapeType}_${sizeItem.dataIndex}`,
            position: {x: 0, y: 0, z: [this.#shapeConfig[shape.shapeType]?.zOffset]},
            material: {
                id: `${shape.shapeType}_mat`,
                color: canvas._theme[this.#shapeConfig[shape.shapeType]?.theme]
            }
        };

        if (shape.condition != null) {
            args.model = item;
            args.material.condition = shape.condition;
        }

        const mesh = await crs.call("gfx_geometry", "from", args);
        mesh.freezeWorldMatrix();
        return mesh;
    }

    async #getText(canvas, text, bold = false, item, sizeItem, yOffset, scale) {
        const textScaling = new BABYLON.Vector3(0.25,0.25,1);
        const rowOffset = scale !== TIMELINE_SCALE.YEAR ? 1.8 : 1.05;

        const stringResult = await crs.call("string", "inflate", {template: text, parameters: item});
        const mesh = await crs.call("gfx_text", "add", {
            element: canvas,
            text: stringResult,
            position: {x: 0.25, y: (-rowOffset - sizeItem.position) - ((0.25 / 2) - yOffset), z: -0.003},
        });
        mesh.freezeWorldMatrix();
        mesh.scaling = textScaling;
        return mesh;
    }

    /**
     * This generates the rows background mesh that shows every other row.
     */
    async #createOffsetRows(itemCount, canvas, width, scale) {
        const yOffset = scale !== TIMELINE_SCALE.YEAR ? 0.25 : 0;
        const offsetRowMesh = await this.#createOffsetRowMesh(width, 1, yOffset, canvas);
        const offsetRowCount = Math.round(itemCount / 2);
        const rowOffsetMatrices = new Float32Array(16 * offsetRowCount);
        const rowOffsetColors = new Float32Array(4 * offsetRowCount);

        let colors = [];

        // Render offset row instances
        const headerOffset = 1;
        for (let i = 0; i < offsetRowCount; i++) {
            const y = -i - headerOffset;

            const matrix = BABYLON.Matrix.Translation(0, y * 2, 0);
            matrix.copyToArray(rowOffsetMatrices, i * 16);
            colors.push(...[0.976, 0.976, 0.976, 1]); // TODO get color from theme
        }

        rowOffsetColors.set(colors);
        offsetRowMesh.thinInstanceSetBuffer("matrix", rowOffsetMatrices);
        offsetRowMesh.thinInstanceSetBuffer("color", rowOffsetColors, 4);
    }

    /**
     * This creates the row mesh for the offset rows.
     */
    async #createOffsetRowMesh(width, height, y = 0, canvas) {
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
            positions: [{x: width / 2, y: y, z: 0}]
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
        const forceRender = await crs.process.getValue(step.args.forceRender, context, process, item);

        const scene = canvas.__layers[layer];

        canvas.__rows.render(items, canvas, scene, startDate, endDate, scale, forceRender);
    }
}

crs.intent.gfx_timeline_rows = RowManagerActions;
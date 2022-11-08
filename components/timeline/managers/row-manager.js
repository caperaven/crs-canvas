import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/geometry-factory-manager.js";
import "../../../src/factory/timeline-shape-factory.js"
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {StaticVirtualization} from "./static-virtualization.js";

/**
 * This class is responsible for rendering the rows and includes generating the geometry and virtualization
 */
export class RowManager {
    #configuration;
    #virtualization;
    #scale;
    #currentX;
    #cameraObserver;
    #shapeConfig = Object.freeze({
        "pillar": {
            barHeight: 0.4,
            triangleHeight: 0.1,
            triangleWidth: 0.1,
            theme: "row_range1",
            yOffset: 0.15,
            zOffset: 0.00001
        },
        "range_indicator": {
            barHeight: 0.05,
            triangleHeight: 0.1,
            triangleWidth: 0.2,
            theme: "row_range3",
            yOffset: 0.35,
            zOffset: 0.00002
        },
        "rect": {
            barHeight: 0.3,
            triangleHeight: null,
            triangleWidth: null,
            theme: "row_range2",
            yOffset: 0.0075,
            zOffset: 0.00003
        }
    })

    constructor(config) {
        this.#configuration = config;
    }

    dispose(canvas) {
        this.#configuration = null;
        this.#virtualization = this.#virtualization.dispose();
        this.#shapeConfig = null;
        canvas?.__camera?.onViewMatrixChangedObservable?.remove(this.#cameraObserver);
        this.#cameraObserver = null;
    }

    /**
     * This cleans up meshes when swapping between timeline views such as day / week ...
     * @param canvas
     * @param scene
     */
    clean(canvas, scene) {
        const meshesToDispose = scene.meshes.filter(mesh => mesh.id.includes("range_item") || mesh.id.includes("offset_row"));
        for (const mesh of meshesToDispose) {
            mesh.dispose();
        }

        this.#virtualization.clearInstances();
    }

    /**
     * This draws the rows based on the data you have given.
     * THis is called at startup and then virtualization will take over.
     */
    async init(items, canvas, scene, baseDate, scale) {
        const itemCount = items.length;
        this.#scale = scale;

        await this.#createOffsetRows(itemCount, canvas, scale);
        await this.#initVirtualization(canvas, scene, items);
        this.#setTextPositions(canvas);
    }

    /**
     * Start the virtualization process.
     */
    async #initVirtualization(canvas, scene, items) {
        const addCallback = async (position, index) => {
            const rowOffset = canvas.__offsets.get("y", this.#scale !== TIMELINE_SCALE.YEAR ? "default_row" : "year_row");

            if (index < 0 || (index > (items.length-1))) return;
            const item = items[index];

            let shapes = [];
            for (const shape of this.#configuration.shapes) {
                if (item[shape.fromField] == null || item[shape.toField] == null || item[shape.fromField] == item[shape.toField] || item[shape.fromField] > item[shape.toField]) {
                    continue
                };
                shapes.push(await this.#drawShape(canvas, shape, item, position, index));
            }

            const parentText = await crs.call("gfx_composite", "create", {
                element: canvas,
                templates: this.#configuration.records,
                parameters: item,
                position: {x: 0.25, y: -rowOffset - position, z: 0},
                margin: {x: 0, y: 0.4, z: canvas.__zIndices.rowText},
                scale: {x: 0.25, y: 0.25, z: 1},
                id: `composite_${position}`
            })
            parentText.isText = true;
            shapes.push(parentText);

            return shapes;
        }

        const removeCallback = (shapes) => {
            if (shapes == null) return;
            for (const shape of shapes) {
                shape.dispose();
            }
        }

        scene.onBeforeRenderObservable.addOnce(async () => {
            this.#virtualization = new StaticVirtualization(canvas.__rowSize, canvas.__camera.view_height, addCallback.bind(this), removeCallback);
            await this.#draw(canvas);
            this.#setTextPositions(canvas);

        });

        this.#cameraObserver = canvas.__camera.onViewMatrixChangedObservable.add(() => {
            this.#draw(canvas);
            this.#setTextPositions(canvas);
        });
    }

    async redraw(count, scale, canvas){
        this.#scale = scale;
        await this.#createOffsetRows(count, canvas, scale)
        await this.#draw(canvas);
        this.#setTextPositions(canvas);
    }

    async #draw(canvas) {
        await this.#virtualization.draw(( canvas.__camera.position.y - canvas.__camera.offset_y) / -1);

    }

    #setTextPositions(canvas) {
        this.#currentX = canvas.__camera.position.x - canvas.__camera.offset_x;
        const instances = this.#virtualization?.instances;
        if (instances == null) return;

        const keys = Object.keys(instances);
        for (const key of keys) {
            if (instances[key] == null) continue;
            for (const shape of instances[key]) {
                if (shape.isText) {
                    shape.position.x = this.#currentX;
                }
            }
        }
    }

    /**
     * This generates the geometry and returns the mesh to draw.
     */
    async #drawShape(canvas, shape, item, position, index) {
        const rowOffset = this.#scale !== TIMELINE_SCALE.YEAR ? 1.5 : 1;

        const result = await crs.call("gfx_timeline_manager", "get", {
            element: canvas,
            start: item[shape.fromField],
            end: item[shape.toField],
            scale:  this.#scale
        });

        item.actual_geom ||= {};
        item.actual_geom[shape.shapeType] ||= await crs.call("gfx_timeline_shape_factory", shape.shapeType, {
            aabb: {
                minX: result.x1,
                minY: (-position - rowOffset) - this.#shapeConfig[shape.shapeType]?.yOffset,
                maxX: result.x2,
                maxY: ((-position - rowOffset) - this.#shapeConfig[shape.shapeType]?.yOffset) - (this.#shapeConfig[shape.shapeType]?.barHeight / 2)
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
            name: `range_item_${shape.shapeType}_${this.#scale}_${index}`,
            position: {x: 0, y: 0, z: canvas.__zIndices.rowShape - this.#shapeConfig[shape.shapeType]?.zOffset},
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
        // mesh.freezeWorldMatrix();
        return mesh;
    }

    /**
     * This generates the rows background mesh that shows every other row.
     */
    async #createOffsetRows(itemCount, canvas) {
        const yOffset = canvas.__offsets.get("y", this.#scale !== TIMELINE_SCALE.YEAR ? "default_offset_row" : "year_offset_row");

        const offsetRowMesh = await this.#createOffsetRowMesh(canvas.__rowSize, yOffset, canvas);
        const offsetRowCount = Math.round(itemCount / 2);
        const rowOffsetMatrices = new Float32Array(16 * offsetRowCount);
        const rowOffsetColors = new Float32Array(4 * offsetRowCount);

        let colors = [];

        let color = BABYLON.Color3.FromHexString(canvas._theme.offset_row_bg);
        // Render offset row instances
        const headerOffset = 1;
        let nextPosition = 0;
        for (let i = 0; i < offsetRowCount; i++) {
            const y = -nextPosition - headerOffset;

            const matrix = BABYLON.Matrix.Translation(0, y * 2, 0);
            matrix.copyToArray(rowOffsetMatrices, i * 16);
            colors.push(...[color.r, color.g, color.b, 1]);
            nextPosition += canvas.__rowSize
        }

        rowOffsetColors.set(colors);
        offsetRowMesh.thinInstanceSetBuffer("matrix", rowOffsetMatrices);
        offsetRowMesh.thinInstanceSetBuffer("color", rowOffsetColors, 4);
    }

    /**
     * This creates the row mesh for the offset rows.
     */
    async #createOffsetRowMesh(height, y = 0, canvas) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                name: "timeline_offset_row_bg",
                type: "plane",
                options: {
                    width: 999999,
                    height: height
                }
            },
            material: {
                id: "timeline_row",
                color: canvas._theme.offset_row_bg,
            },
            positions: [{x: 0, y: y, z: canvas.__zIndices.offsetRow}]
        })
        return meshes[0];
    }
}
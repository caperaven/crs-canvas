import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/geometry-factory-manager.js";
import "../../../src/factory/timeline-shape-factory.js"
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TimelineShapes} from "../timeline-shapes.js";

/**
 * This class is responsible for rendering the rows and includes generating the geometry and virtualization
 */
export class RowManager {
    #configuration;
    #virtualization;
    #scale;
    #cameraObserver;

    constructor(config) {
        this.#configuration = config;
    }

    dispose(canvas) {
        this.#configuration = null;
        this.#scale = null;
        this.#virtualization = this.#virtualization.dispose();
        canvas?.__camera?.onViewMatrixChangedObservable?.remove(this.#cameraObserver);
        this.#cameraObserver = null;
    }

    clean(canvas, scene) {
        const meshesToDispose = scene.meshes.filter(mesh => mesh.id.includes("range_item") || mesh.id.includes("offset_row"));
        for (const mesh of meshesToDispose) {
            mesh.dispose();
        }

        this.#virtualization.clearInstances();
    }


    async init(items, canvas, scene, baseDate, scale) {
        const itemCount = items.length;
        this.#scale = scale;

        await this.#createOffsetRows(itemCount, canvas, scale);
        await this.#initVirtualization(canvas, scene, items);
        this.#setTextPositions(canvas);
    }


    async #initVirtualization(canvas, scene, items) {
        const addCallback = async (position, index) => {
            if (index < 0 || (index > (items.length-1))) return;
            return this.#drawRow(position, index, items[index], canvas);
        }

        const removeCallback =async (shapes) => {
            await this.#removeRow(shapes)
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



    async #removeRow(shapes, position) {
        shapes = shapes || this.#virtualization.instances[position];
        if (shapes == null) return;
        for (const shape of shapes) {
            shape.dispose();
        }
        delete this.#virtualization.instances[position];
    }

    #setTextPositions(canvas) {
        const instances = this.#virtualization?.instances;
        if (instances == null) return;

        const keys = Object.keys(instances);
        for (const key of keys) {
            if (instances[key] == null) continue;
            for (const shape of instances[key]) {
                if (shape.isText) {
                    shape.position.x = canvas.__camera.position.x - canvas.__camera.offset_x;
                }
            }
        }
    }

    async redrawAtPosition(position, index, item, canvas) {
        await this.#removeRow(null,position);
        this.#virtualization.instances[position] = await this.#drawRow(position, index, item, canvas);
        this.#setTextPositions(canvas);
    }

    async #drawRow(position, index, item, canvas) {
        item.__position = position;

        let shapes = [];
        for (const shape of this.#configuration.shapes) {
            if (item[shape.fromField] == null || item[shape.toField] == null || item[shape.fromField] == item[shape.toField] || item[shape.fromField] > item[shape.toField]) {
                continue;
            }
            shapes.push(await this.#drawShape(canvas, shape, item, position, index));
        }

        shapes.push(await this.#drawText(position, item, canvas));

        return shapes;
    }

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
                minY: (-position - rowOffset) - TimelineShapes[shape.shapeType]?.yOffset,
                maxX: result.x2,
                maxY: ((-position - rowOffset) - TimelineShapes[shape.shapeType]?.yOffset) - (TimelineShapes[shape.shapeType]?.barHeight / 2)
            },
            triangle_height: TimelineShapes[shape.shapeType]?.triangleHeight,
            triangle_width: TimelineShapes[shape.shapeType]?.triangleWidth,
            bar_height: TimelineShapes[shape.shapeType]?.barHeight
        });

        const args = {
            element: canvas,
            data: {
                positions: item.actual_geom[shape.shapeType].vertices,
                indices: item.actual_geom[shape.shapeType].indices
            },
            name: `range_item_${shape.shapeType}_${this.#scale}_${index}`,
            position: {x: 0, y: 0, z: canvas.__zIndices.rowShape - TimelineShapes[shape.shapeType]?.zOffset},
            material: {
                id: `${shape.shapeType}_mat`,
                color: canvas._theme[TimelineShapes[shape.shapeType]?.theme]
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

    async #drawText(position, item, canvas) {
        const rowOffset = canvas.__offsets.get("y", this.#scale !== TIMELINE_SCALE.YEAR ? "default_row" : "year_row");
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
        return parentText;
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
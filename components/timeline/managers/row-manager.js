import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/geometry-factory-manager.js";
import "../../../src/factory/timeline-shape-factory.js"
import {TIMELINE_SCALE} from "../timeline-scale.js";
import {StaticVirtualization} from "./static-virtualization.js";
import {TimelineShapes} from "../timeline-shapes.js";
import {createRect} from "../timeline-helpers.js";

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

    clear(canvas, scene) {
        const meshesToDispose = scene.meshes.filter(mesh => mesh.id.includes("range_item") || mesh.id.includes("offset_row"));
        for (const mesh of meshesToDispose) {
            mesh.dispose();
        }

        this.#virtualization.clearInstances();
    }

    async render(items, canvas, scene, baseDate, scale) {
        this.#scale = scale;
        await this.#waitTillReady(scene);
        await this.#initVirtualization(canvas, scene, items);
        const itemCount = items.length;
        await this.#createOffsetRows(itemCount, canvas, scale);
        await this.#draw(canvas);
        this.#cameraObserver = canvas.__camera.onViewMatrixChangedObservable.add(() => {
            this.#draw(canvas);
            this.#setTextPositions(canvas);
        });
    }

    async redrawRowAtIndex(index, item, canvas) {
        const position = this.#getPositionForIndex(index, canvas);
        await this.#removeRow(null,position);
        this.#virtualization.instances[position] = await this.#drawRow(position, index, item, canvas);
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
        this.#virtualization = new StaticVirtualization(canvas.__rowSize, canvas.__camera.view_height, addCallback.bind(this), removeCallback);
    }

    async #waitTillReady(scene) {
        return new Promise((resolve)=> {
            scene.onBeforeRenderObservable.addOnce(async () => {
                resolve();
            });
        });
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

                if (shape.isTextBackground) {
                    shape.position.x = 2.5 + (canvas.__camera.position.x - canvas.__camera.offset_x);
                }
            }
        }
    }

    async #draw(canvas) {
        await this.#virtualization.draw(( canvas.__camera.position.y - canvas.__camera.offset_y) / -1);
        this.#setTextPositions(canvas);
    }

    async #drawRow(position, index, item, canvas) {

        const rowOffset = this.#scale !== TIMELINE_SCALE.YEAR ? canvas.__offsets.y.default_row : canvas.__offsets.y.year_row;
        const textBgYOffset =this.#scale !== TIMELINE_SCALE.YEAR ? canvas.__offsets.y.default_text_offset_row_bg : canvas.__offsets.y.year_text_offset_row_bg;
        let shapes = [];

        //Create shapes
        for (const shape of this.#configuration.shapes) {
            // old condition || item[shape.fromField] == item[shape.toField] || item[shape.fromField] > item[shape.toField]
            if (item[shape.fromField] == null || item[shape.toField] == null ) {
                continue
            }
            shapes.push(await this.#drawShape(canvas, shape, item, position, index));
        }

        shapes.push(await this.#drawText(position, item, canvas));

        //Create text background
        const isEven = index % 2 === 1;
        const color = isEven ? canvas._theme.offset_row_bg : canvas._theme.light_row_text_bg;
        const textBackground = await createRect("timeline_offset_row_text_bg", color, 0, -rowOffset - position - textBgYOffset, canvas.__zIndices.offsetTextRow, 5,  canvas.__rowSize - 0.05, canvas, false);
        textBackground.isTextBackground = true;
        shapes.push(textBackground);

        return shapes;
    }

    async #drawShape(canvas, shape, item, position, index) {
        const rowOffset = this.#scale !== TIMELINE_SCALE.YEAR ? canvas.__offsets.y.default_offset_row_bg : canvas.__offsets.y.year_offset_row_bg;
        const shapeProperties = TimelineShapes[shape.shapeType];

        const result = await crs.call("gfx_timeline_manager", "get", {
            element: canvas,
            start: item[shape.fromField],
            end: item[shape.toField],
            scale:  this.#scale
        });


        item.actual_geom = {};
        item.actual_geom[shape.shapeType] ||= await crs.call("gfx_timeline_shape_factory", shape.shapeType, {
            aabb: {
                minX: result.x1,
                minY: (-position - rowOffset) - shapeProperties.yOffset,
                maxX: result.x2,
                maxY: ((-position - rowOffset) - shapeProperties.yOffset) - (shapeProperties.barHeight / 2)
            },
            triangle_height: shapeProperties.triangleHeight,
            triangle_width: shapeProperties.triangleWidth,
            bar_height: shapeProperties.barHeight
        });

        const args = {
            element: canvas,
            data: {
                positions: item.actual_geom[shape.shapeType].vertices,
                indices: item.actual_geom[shape.shapeType].indices
            },
            name: `range_item_${shape.shapeType}_${this.#scale}_${index}`,
            position: {x: 0, y: 0, z: canvas.__zIndices.rowShape - shapeProperties.zOffset},
            material: {
                id: `${shape.shapeType}_mat`,
                color: canvas._theme[shapeProperties.theme]
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
        const rowOffset = this.#scale !== TIMELINE_SCALE.YEAR ? canvas.__offsets.y.default_row : canvas.__offsets.y.year_row;
        //Create Text
        //TODO KR: creating text should return size of largest string of text in order to set width of backgroun
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
        const yOffset = this.#scale !== TIMELINE_SCALE.YEAR ? canvas.__offsets.y.default_offset_row : canvas.__offsets.y.year_offset_row;

        const offsetRowMesh = await this.#createOffsetRowMesh(999999,  canvas.__rowSize, {x: 0, y: yOffset, z: canvas.__zIndices.offsetRow}, canvas, "timeline_offset_row_bg");
        const offsetRowCount = Math.round(itemCount / 2);
        const rowOffsetMatrices = new Float32Array(16 * offsetRowCount);

        // Render offset row instances
        const headerOffset = 1;
        let nextPosition = 0;
        for (let i = 0; i < offsetRowCount; i++) {
            const y = -nextPosition - headerOffset;

            const matrix = BABYLON.Matrix.Translation(0, y * 2, 0);
            matrix.copyToArray(rowOffsetMatrices, i * 16);
            nextPosition += canvas.__rowSize
        }

        offsetRowMesh.thinInstanceSetBuffer("matrix", rowOffsetMatrices);
    }

    /**
     * This creates the row mesh for the offset rows.
     */
    async #createOffsetRowMesh(width, height, position, canvas, meshId = "timeline_offset_row_bg", matId = "timeline_row", color = canvas._theme.offset_row_bg) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas,
            mesh: {
                name: meshId,
                type: "plane",
                options: {
                    width: width,
                    height: height
                }
            },
            material: {
                id: matId,
                color: color,
            },
            positions: [{x: position.x, y: position.y, z: position.z}]
        })
        return meshes[0];
    }

    #getPositionForIndex(index, canvas) {
        return (canvas.__rowSize * index);
    }
}
import {TIMELINE_SCALE} from "../timeline_scale.js";
import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";
import {DayHeaderManager} from "./header-managers/day-header-manager.js";
import {WeekHeaderManager} from "./header-managers/week-header-manager.js";
import {MonthHeaderManager} from "./header-managers/month-header-manager.js";
import {YearHeaderManager} from "./header-managers/year-header-manager.js";

class HeaderManager {

    #bgMesh;
    #headerMesh;
    #headerParticleSystem;
    #dayHeaderManager;
    #weekHeaderManager;
    #monthHeaderManager;
    #yearHeaderManager;
    #scaleToManager;

    constructor() {
        this.#initScaleManagers();
    }

    dispose() {
        this.#bgMesh?.dispose();
        this.#bgMesh = null;

        this.#headerMesh?.dispose();
        this.#headerMesh = null;

        this.#headerParticleSystem?.dispose();
        this.#headerParticleSystem = null;

        this.#dayHeaderManager?.dispose();
        this.#dayHeaderManager = null;
        this.#weekHeaderManager?.dispose();
        this.#weekHeaderManager = null;
        this.#monthHeaderManager?.dispose();
        this.#monthHeaderManager = null;
        this.#yearHeaderManager?.dispose();
        this.#yearHeaderManager = null;
        this.#scaleToManager = null;
    }

    async clean(canvas, scene) {
        //clean big mesh
        const timelineHeaderBorderMesh = scene.getMeshByID("timeline_header_border");
        timelineHeaderBorderMesh?.dispose();

        //clean header_mesh/s
        await crs.call("gfx_particles", "remove", {element: canvas, id: "timeline_headers"});
    }

    async render(startDate, endDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;
        const rangeProperties = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            min: startDate,
            max: endDate,
            scale: scale
        });

        const bigMeshHeight = scale !== TIMELINE_SCALE.YEAR ? 1.75 : 0.75
        this.#bgMesh = await this.#createBgMesh(canvas, rangeProperties.totalWidth, bigMeshHeight);

        const textScaling = new BABYLON.Vector3(0.25,0.25,1);
        const tempStartDate = new Date(startDate);
        this.#headerParticleSystem = await crs.call("gfx_particles", "add", {
            element: canvas,
            shapes: await this.#scaleToManager[scale].getShapes(new Date(startDate), new Date(endDate), canvas, rangeProperties, scale),
            id: "timeline_headers",
            particleCallback: (shape, particle, i) => {
                if(shape.includes("header_plane")) {
                    this.#scaleToManager[scale].getColors(tempStartDate, shape, particle, i, canvas);
                }
                else {
                    particle.scaling = textScaling;
                }
            }
        });
        await this.#observeCamera(canvas);
    }

    #initScaleManagers() {
        this.#dayHeaderManager   = new DayHeaderManager();
        this.#weekHeaderManager  = new WeekHeaderManager();
        this.#monthHeaderManager = new MonthHeaderManager();
        this.#yearHeaderManager  = new YearHeaderManager();

        this.#scaleToManager = Object.freeze({
            "day":   this.#dayHeaderManager,
            "week":  this.#weekHeaderManager,
            "month": this.#monthHeaderManager,
            "year":  this.#yearHeaderManager,
        })
    }

    async #observeCamera(canvas) {
        canvas.__camera.onViewMatrixChangedObservable.add((camera)=> {

            this.#set_mesh_positions(camera)
        });
        this.#set_mesh_positions(canvas.__camera)
    }

    #set_mesh_positions(camera) {
        this.#headerParticleSystem.mesh.position.y = camera.position.y - camera.offset_y ;
        this.#bgMesh.position.y = camera.position.y - 0.375 - camera.offset_y;
    }

    /**
     * Creates a long backing mesh
     */
    async #createBgMesh(canvas, width, height) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas, mesh: {
                name: "timeline_header_border",
                type: "plane",
                options: {
                    width: width,
                    height: height
                }
            }, material: {
                id: "timeline_header_border", color: canvas._theme.header_border,
            }, positions: [{x: width / 2, y: -0.375, z: -0.01}]
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
        return;
        const canvas = await crs.dom.get_element(step, context, process, item);

        const startDate = await crs.process.getValue(step.args.start_date, context, process, item);
        const endDate = await crs.process.getValue(step.args.end_date, context, process, item);
        const scale = await crs.process.getValue(step.args.scale, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        canvas.__headers.render(startDate, endDate, scale, canvas, scene);
    }

    static async clean(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        await canvas.__headers.clean(canvas, scene);
    }
}


crs.intent.gfx_timeline_header = HeaderManagerActions;
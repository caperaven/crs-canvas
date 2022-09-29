import {TIMELINE_SCALE} from "../timeline_scale.js";
import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";

class HeaderManager {

    #bgMesh;
    #headerMesh;
    #headerParticleSystem;

    dispose() {
        this.#bgMesh?.dispose();
        this.#bgMesh = null;

        this.#headerMesh?.dispose();
        this.#headerMesh = null;

        this.#headerParticleSystem?.dispose();
        this.#headerParticleSystem = null;
    }

    async render(startDate, endDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;

        const dayCount = getDaysBetweenDates(startDate, endDate);

        this.#bgMesh = await this.#createBgMesh(canvas, dayCount);


        const textScaling = new BABYLON.Vector3(0.25,0.25,1);

       this.#headerParticleSystem =  await crs.call("gfx_particles", "add", {
            element: canvas,
            shapes: await getHeaderShapes( new Date(startDate.getTime()), endDate, canvas),
            systemId: "timeline_headers",
            particleCallback: (shape, particle, i) => {
                if(shape === "header_plane") {
                    const dayNumber = startDate.getUTCDay();
                    if (dayNumber === 5 || dayNumber === 6) {
                        particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
                    } else {
                        particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
                    }
                    startDate.setUTCDate(startDate.getUTCDate() + 1);
                }
                else {
                    particle.scaling = textScaling;
                }
            }
        });

        await this.#observeCamera(canvas);
    }

    async #observeCamera(canvas) {
        canvas.__camera.onViewMatrixChangedObservable.add((camera)=> {
            this.#headerParticleSystem.mesh.position.y = camera.position.y;
            this.#bgMesh.position.y = camera.position.y - 0.375;
        })
    }

    async #createBgMesh(canvas, size) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas, mesh: {
                id: "timeline_header_border",
                type: "plane",
                options: {
                    width: size,
                    height: 0.75
                }
            }, material: {
                id: "timeline_header_border", color: canvas._theme.header_border,
            }, positions: [{x: size / 2, y: -0.375, z: -0.01}]
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

async function getHeaderShapes(startDate, endDate, canvas) {
    const dayCount = getDaysBetweenDates(startDate, endDate);

    const headerPlane = await createHeaderMesh(canvas);

    const monMesh = await createHeaderText("Mon", canvas);
    const tueMesh = await createHeaderText("Tue", canvas);
    const wedMesh = await createHeaderText("Wed", canvas);
    const thuMesh = await createHeaderText("Thu", canvas);
    const friMesh = await createHeaderText("Fri", canvas);
    const satMesh = await createHeaderText("Sat", canvas);
    const sunMesh = await createHeaderText("Sun", canvas);

    const result = {
        mon: {
            mesh: monMesh,
            positions: []
        },
        tue: {
            mesh: tueMesh,
            positions: []
        },
        wed: {
            mesh: wedMesh,
            positions: []
        },
        thu: {
            mesh: thuMesh,
            positions: []
        },
        fri: {
            mesh: friMesh,
            positions: []
        },
        sat: {
            mesh: satMesh,
            positions: []
        },
        sun: {
            mesh: sunMesh,
            positions: []
        },
        header_plane: {
            mesh: headerPlane,
            positions: []
        }
    }

    for (let i = 1; i <= 31; i++) {
        result[i] = {
            positions: [],
            mesh: await createHeaderText(i.toString(), canvas, true)
        }
    }

    for (let i = 0; i < dayCount; i++) {

        const day = startDate.toLocaleString('en-us', {weekday:'short'})
        const dayNumber = startDate.getDate();

        result[day.toLowerCase()].positions.push(0.25 +i, -0.3, -0.02);

        result.header_plane.positions.push( 0.5 + i, -0.375, -0.01);

        result[dayNumber].positions.push( 0.375 + i, -0.55, -0.01);
        startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    return result;

}

async function createHeaderText(text, canvas, bold = false) {
    const min = bold ? 0.2 : 0.1;
    const max = bold ? 0.5 : 1.25;

    const textMesh = await crs.call("gfx_text", "add", { element: canvas, text: text, position: {y: 0.5}, attributes: [
            {
                fn: "Float",
                name: "min",
                value: min
            },
            {
                fn: "Float",
                name: "max",
                value: max
            }
        ]});
    return textMesh;
}

async function createHeaderMesh(canvas) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: canvas, mesh: {
            id: "timeline_header", type: "plane", options: {
                width: 0.98, height: 0.72
            }
        }, material: {
            id: "timeline_header", color: canvas._theme.header_bg,
        }, positions: [{x: 0, y: 0, z: 0}]
    })

    return meshes[0];
}

crs.intent.gfx_timeline_header = HeaderManagerActions;
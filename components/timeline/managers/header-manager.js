import {TIMELINE_SCALE} from "../timeline_scale.js";
import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";

class HeaderManager {

    #bgMesh;
    #headerMesh;
    #headerParticleSystem;
    #scaleToShape = Object.freeze({
        "day":   this.#getDayHeaderShapes.bind(this),
        "week":  this.#getWeekHeaderShapes.bind(this),
        "month": this.#getMonthHeaderShapes.bind(this),
        "year":  this.#getYearHeaderShapes.bind(this)
    })
    #scaleToColour = Object.freeze({
        "day":   this.#getDayHeaderColours.bind(this),
        "week":  this.#getWeekHeaderColours.bind(this),
        "month": this.#getMonthHeaderColours.bind(this),
        "year":  this.#getYearHeaderColours.bind(this)
    })

    dispose() {
        this.#bgMesh?.dispose();
        this.#bgMesh = null;

        this.#headerMesh?.dispose();
        this.#headerMesh = null;

        this.#headerParticleSystem?.dispose();
        this.#headerParticleSystem = null;
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
        const result = await crs.call("gfx_timeline_manager", "set_range", {
            element: canvas,
            min: startDate,
            max: endDate,
            scale: scale
        });

        this.#bgMesh = await this.#createBgMesh(canvas, result.totalWidth);

        const textScaling = new BABYLON.Vector3(0.25,0.25,1);
        const tempStartDate = new Date(startDate);
        const tempEndDate = new Date(endDate);

        this.#headerParticleSystem = await crs.call("gfx_particles", "add", {
            element: canvas,
            shapes: await this.#scaleToShape[scale](tempStartDate, tempEndDate, canvas, result.items, result.width, scale),
            id: "timeline_headers",
            particleCallback: (shape, particle, i) => {
                if(shape.includes("header_plane")) {
                    this.#scaleToColour[scale](tempStartDate, particle, i, canvas);
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
    async #createBgMesh(canvas, size) {
        const meshes = await crs.call("gfx_mesh_factory", "create", {
            element: canvas, mesh: {
                name: "timeline_header_border",
                type: "plane",
                options: {
                    width: size,
                    height: 0.75
                }
            }, material: {
                id: "timeline_header_border", color: canvas._theme.header_border,
            }, positions: [{x: size / 2, y:   -0.375, z: -0.01}]
        })

        return meshes[0];
    }

    #getDayHeaderColours(startDate, particle, i, canvas) {
        //Will need to think about the configuration here i.e. user defined working hours
        const hours = startDate.getHours();

        if (hours < 8 || hours > 17) {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
        } else {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
        }

        startDate.setMinutes(startDate.getMinutes() + 30);
    }

    #getWeekHeaderColours(startDate, particle, i, canvas) {
        //Will need to think about the configuration here i.e. user defined work week
        const dayNumber = startDate.getUTCDay();
        if (dayNumber === 5 || dayNumber === 6) {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
        } else {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
        }
        startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    #getMonthHeaderColours(startDate, particle, i, canvas) {
        //Will need to think about the configuration here i.e. user defined work week
        const dayNumber = startDate.getUTCDay();
        if (dayNumber === 5 || dayNumber === 6) {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
        } else {
            particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
        }
        startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    #getYearHeaderColours(startDate, particle, i, canvas) {
        particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
    }

    async #getDayHeaderShapes(startDate, endDate, canvas, numberOfItems, width, scale) {
        const headerPlane = await createHeaderMesh(canvas, width, 0.02);

        const result = {
            header_plane: {
                mesh: headerPlane,
                positions: []
            }
        }

        //NOTE KR: including rending 00:00 for the moment
        for (let i = 0; i <= 24; i++) {
            const text = i < 10 ? `0${i.toString()}:00` : `${i.toString()}:00`;
            result[i] = {
                positions: [],
                mesh: await createHeaderText(text, canvas, true)
            }
        }

        for (let i = 0; i < numberOfItems; i++) {
            const hourNumber = startDate.getHours();

            result[hourNumber].positions.push(-0.275 + ((i * width) * 2), -0.3, -0.02);
            result.header_plane.positions.push(0.5 + i, -0.375, -0.01);

            startDate.setHours(hourNumber + 1);
        }

        return result;
    }

    async #getWeekHeaderShapes(startDate, endDate, canvas, numberOfItems, width, scale) {
        const headerPlane = await createHeaderMesh(canvas, width, 0.02);

        const monMesh = await createHeaderText("Monday", canvas);
        const tueMesh = await createHeaderText("Tuesday", canvas);
        const wedMesh = await createHeaderText("Wednesday", canvas);
        const thuMesh = await createHeaderText("Thursday", canvas);
        const friMesh = await createHeaderText("Friday", canvas);
        const satMesh = await createHeaderText("Saturday", canvas);
        const sunMesh = await createHeaderText("Sunday", canvas);

        const result = {
            monday: {
                mesh: monMesh,
                positions: []
            },
            tuesday: {
                mesh: tueMesh,
                positions: []
            },
            wednesday: {
                mesh: wedMesh,
                positions: []
            },
            thursday: {
                mesh: thuMesh,
                positions: []
            },
            friday: {
                mesh: friMesh,
                positions: []
            },
            saturday: {
                mesh: satMesh,
                positions: []
            },
            sunday: {
                mesh: sunMesh,
                positions: []
            },
            header_plane: {
                mesh: headerPlane,
                positions: []
            }
        }

        for (let i = 1; i <= 31; i++) {
            const text = i < 10 ? `0${i.toString()}`: i.toString();
            result[i] = {
                positions: [],
                mesh: await createHeaderText(text, canvas, true)
            }
        }

        for (let i = 0; i < numberOfItems; i++) {
            result.header_plane.positions.push((width / 2) + (i * width), -0.375, -0.01);

            const day = startDate.toLocaleString('en-us', {weekday:'long'})
            const dayNumber = startDate.getDate();

            result[dayNumber].positions.push(0.25 + (i * width), -0.45, -0.01);
            result[day.toLowerCase()].positions.push(0.7 + (i * width), -0.45, -0.02);

            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }

        return result;
    }

    async #getMonthHeaderShapes(startDate, endDate, canvas, numberOfItems, width, scale) {
        const headerPlane = await createHeaderMesh(canvas, width);

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
            const text = i < 10 ? `0${i.toString()}`: i.toString();
            result[i] = {
                positions: [],
                mesh: await createHeaderText(text, canvas, true)
            }
        }

        for (let i = 0; i < numberOfItems; i++) {
            const day = startDate.toLocaleString('en-us', {weekday:'short'})
            const dayNumber = startDate.getDate();

            result[day.toLowerCase()].positions.push(0.25 + i, -0.3, -0.02);

            result.header_plane.positions.push(0.5 + i, -0.375, -0.01);

            result[dayNumber].positions.push(0.325 + i, -0.55, -0.01);
            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }

        return result;
    }

    async #getYearHeaderShapes(startDate, endDate, canvas, numberOfItems, width, scale) {
        console.log("getting year shapes");
        const janMesh = await createHeaderText("January", canvas);
        const febMesh = await createHeaderText("February", canvas);
        const marMesh = await createHeaderText("March", canvas);
        const aprMesh = await createHeaderText("April", canvas);
        const mayMesh = await createHeaderText("May", canvas);
        const junMesh = await createHeaderText("June", canvas);
        const julMesh = await createHeaderText("July", canvas);
        const augMesh = await createHeaderText("August", canvas);
        const sepMesh = await createHeaderText("September", canvas);
        const octMesh = await createHeaderText("October", canvas);
        const novMesh = await createHeaderText("November", canvas);
        const decMesh = await createHeaderText("December", canvas);

        const result = {
            0: {
                mesh: janMesh,
                positions: []
            },
            1: {
                mesh: febMesh,
                positions: []
            },
            2: {
                mesh: marMesh,
                positions: []
            },
            3: {
                mesh: aprMesh,
                positions: []
            },
            4: {
                mesh: mayMesh,
                positions: []
            },
            5: {
                mesh: junMesh,
                positions: []
            },
            6: {
                mesh: julMesh,
                positions: []
            },
            7: {
                mesh: augMesh,
                positions: []
            },
            8: {
                mesh: sepMesh,
                positions: []
            },
            9: {
                mesh: octMesh,
                positions: []
            },
            10: {
                mesh: novMesh,
                positions: []
            },
            11: {
                mesh: decMesh,
                positions: []
            }
        }

        let totalTextDistance = 0;
        let totalHeaderDistance = 0;
        for (let i = 0; i < numberOfItems; i++) {
            if (result[`header_plane_${width[i]}`] == null) {
                const meshes = await crs.call("gfx_mesh_factory", "create", {
                    element: canvas, mesh: {
                        name: `timeline_header_${i}`, type: "plane", options: {
                            width: width[i] - 0.02, height: 0.72
                        }
                    }, material: {
                        id: `timeline_header_${i}`, color: canvas._theme.header_bg,
                    }, positions: [{x: 0, y: 0, z: 0}]
                })
                result[`header_plane_${width[i]}`] = {
                    mesh: meshes[0],
                    positions: []
                }
            }

            if (i > 0) {
                totalTextDistance += width[i - 1];
                totalHeaderDistance += ((width[i - 1] / 2) + (width[i] / 2));
            }

            result[`header_plane_${width[i]}`].positions.push(totalHeaderDistance + (width[0] / 2), -0.375, -0.01);

            const month = startDate.getMonth();
            result[month].positions.push((totalTextDistance + (width[0] / 2)) - 0.45, -0.4, -0.02);

            startDate.setMonth(month + 1);
        }

        return result;
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

    static async clean(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);

        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        await canvas.__headers.clean(canvas, scene);
    }
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

async function createHeaderMesh(canvas, width, offset = 0.02) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: canvas, mesh: {
            name: "timeline_header", type: "plane", options: {
                width: width - offset, height: 0.72
            }
        }, material: {
            id: "timeline_header", color: canvas._theme.header_bg,
        }, positions: [{x: 0, y: 0, z: 0}]
    })

    return meshes[0];
}

crs.intent.gfx_timeline_header = HeaderManagerActions;
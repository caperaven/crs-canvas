import {TIMELINE_SCALE} from "../timeline_scale.js";
import "../../../src/managers/mesh-factory-manager.js";
import "../../../src/managers/particle-manager.js";
import "../../../src/managers/text-manager.js";

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

//Will need to think about the configuration here i.e. user defined working hours
class DayHeaderManager {
    getColors(startDate, shape, particle, i, canvas) {
        if (shape === "header_plane") {
            const hours = startDate.getHours();

            if (hours < 8 || hours > 17) {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
            } else {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
            }

            startDate.setMinutes(startDate.getMinutes() + 30);
        }
    }

    async getShapes(startDate, endDate, canvas, rangeProperties, scale) {
        const width = rangeProperties.width;
        const secondaryWidth = width * 48;
        const numberOfItems = rangeProperties.items;

        const headerPlane = await createHeaderMesh(canvas, null, width, 0.02);
        const secondaryHeaderPlane = await createHeaderMesh(canvas, "timeline_header_secondary", secondaryWidth, 0.02, 0.45, "timeline_header_secondary", canvas._theme.secondary_header_bg);

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
            header_plane: {
                mesh: headerPlane,
                positions: []
            },
            secondary_header_plane: {
                mesh: secondaryHeaderPlane,
                positions: []
            },
            month_0: {
                mesh: janMesh,
                positions: []
            },
            month_1: {
                mesh: febMesh,
                positions: []
            },
            month_2: {
                mesh: marMesh,
                positions: []
            },
            month_3: {
                mesh: aprMesh,
                positions: []
            },
            month_4: {
                mesh: mayMesh,
                positions: []
            },
            month_5: {
                mesh: junMesh,
                positions: []
            },
            month_6: {
                mesh: julMesh,
                positions: []
            },
            month_7: {
                mesh: augMesh,
                positions: []
            },
            month_8: {
                mesh: sepMesh,
                positions: []
            },
            month_9: {
                mesh: octMesh,
                positions: []
            },
            month_10: {
                mesh: novMesh,
                positions: []
            },
            month_11: {
                mesh: decMesh,
                positions: []
            }
        }

        //NOTE KR: including rending 00:00 for the moment
        for (let i = 0; i <= 24; i++) {
            const text = i < 10 ? `0${i.toString()}:00` : `${i.toString()}:00`;
            result[`hour_${i}`] = {
                positions: [],
                mesh: await createHeaderText(text, canvas, true)
            }
        }

        for (let i = 1; i <= 31; i++) {
            const text = i < 10 ? `0${i.toString()}`: i.toString();
            result[`day_${i}`] = {
                positions: [],
                mesh: await createHeaderText(text, canvas, true)
            }
        }

        const hourNumber = startDate.getHours();
        if (hourNumber > 0) {
            result.secondary_header_plane.positions.push((secondaryWidth / 2) - (hourNumber * 2), -0.25, -0.01);

            if (hourNumber < 23) {
                await this.#setSecondaryShapes(result, startDate, canvas, 0.2, 0.5, 1.7);
            }
        }

        for (let i = 0; i < numberOfItems; i++) {
            const hourNumber = startDate.getHours();

            result[`hour_${hourNumber}`].positions.push(-0.275 + (i * 2), -0.8, -0.02);
            result.header_plane.positions.push(0.5 + i, -0.875, -0.01);
            if (hourNumber === 0) {
                result.secondary_header_plane.positions.push((secondaryWidth / 2) + (i * 2), -0.25, -0.01);

                await this.#setSecondaryShapes(result, startDate, canvas, (i * 2) + 0.2, (i * 2) + 0.5, (i * 2) + 1.7);
            }

            startDate.setHours(hourNumber + 1);
        }

        return result;
    }

    async #setSecondaryShapes(result, startDate, canvas, dayX, monthX, yearX) {
        const day = startDate.getDate();
        const month = startDate.getMonth();
        const year = startDate.getFullYear();

        result[`day_${day}`].positions.push(dayX, -0.325, -0.01);
        result[`month_${month}`].positions.push(monthX, -0.325, -0.01);

        if (result[`year_${year}`] == null) {
            result[`year_${year}`] = {
                positions: [],
                mesh: await createHeaderText(`${year}`, canvas)
            }
        }
        result[`year_${year}`].positions.push(yearX, -0.325, -0.01);
    }
}

//Will need to think about the configuration here i.e. user defined work week
class WeekHeaderManager {
    getColors(startDate, shape, particle, i, canvas) {
        if (shape === "header_plane") {
            const dayNumber = startDate.getUTCDay();
            if (dayNumber === 5 || dayNumber === 6) {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
            } else {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
            }
            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }
    }

    async getShapes(startDate, endDate, canvas, rangeProperties, scale) {
        const width = rangeProperties.width;
        const secondaryWidth = width * 7;
        const numberOfItems = rangeProperties.items;

        const headerPlane = await createHeaderMesh(canvas, null, width, 0.02);
        const secondaryHeaderPlane = await createHeaderMesh(canvas, "timeline_header_secondary", secondaryWidth, 0.02, 0.45, "timeline_header_secondary", canvas._theme.secondary_header_bg);

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
            month_0: {
                mesh: janMesh,
                positions: []
            },
            month_1: {
                mesh: febMesh,
                positions: []
            },
            month_2: {
                mesh: marMesh,
                positions: []
            },
            month_3: {
                mesh: aprMesh,
                positions: []
            },
            month_4: {
                mesh: mayMesh,
                positions: []
            },
            month_5: {
                mesh: junMesh,
                positions: []
            },
            month_6: {
                mesh: julMesh,
                positions: []
            },
            month_7: {
                mesh: augMesh,
                positions: []
            },
            month_8: {
                mesh: sepMesh,
                positions: []
            },
            month_9: {
                mesh: octMesh,
                positions: []
            },
            month_10: {
                mesh: novMesh,
                positions: []
            },
            month_11: {
                mesh: decMesh,
                positions: []
            },
            header_plane: {
                mesh: headerPlane,
                positions: []
            },
            secondary_header_plane: {
                mesh: secondaryHeaderPlane,
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

        const startingDay = startDate.getUTCDay();
        if (startingDay < 6) {
            result.secondary_header_plane.positions.push((secondaryWidth / 2) - ((startingDay + 1) * 4), -0.25, -0.01);
            await this.#setSecondaryShapes(result, startDate,  canvas,  0.2, 1.4)
        }

        for (let i = 0; i < numberOfItems; i++) {
            const day = startDate.toLocaleString('en-us', {weekday:'long'})
            const dayNumber = startDate.getDate();
            const utcDay = startDate.getUTCDay();

            result.header_plane.positions.push((width / 2) + (i * width), -0.875, -0.01);

            result[dayNumber].positions.push(0.25 + (i * width), -0.95, -0.01);
            result[day.toLowerCase()].positions.push(0.7 + (i * width), -0.95, -0.02);

            if (utcDay === 6) {
                result.secondary_header_plane.positions.push((secondaryWidth / 2) + (i * width), -0.25, -0.01);
                await this.#setSecondaryShapes(result, startDate,  canvas,  (i * width) + 0.25, (i * width) + 1.5)
            }

            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }
        return result;
    }

    async #setSecondaryShapes(result, startDate, canvas, monthX, yearX) {
        const month = startDate.getMonth();
        result[`month_${month}`].positions.push(monthX, -0.325, -0.01);

        const year = startDate.getFullYear();
        if (result[`year_${year}`] == null) {
            result[`year_${year}`] = {
                positions: [],
                mesh: await createHeaderText(`${year}`, canvas)
            }
        }
        result[`year_${year}`].positions.push(yearX, -0.325, -0.01);
    }
}

//Will need to think about the configuration here i.e. user defined work week
class MonthHeaderManager {
    getColors(startDate, shape, particle, i, canvas) {
        if (shape === "header_plane") {
            const dayNumber = startDate.getUTCDay();
            if (dayNumber === 5 || dayNumber === 6) {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
            } else {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
            }
            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }
    }

    async getShapes(startDate, endDate, canvas, rangeProperties, scale) {
        const width = rangeProperties.width;
        const secondaryWidth = width * 7;
        const numberOfItems = rangeProperties.items;

        const headerPlane = await createHeaderMesh(canvas, "timeline_header_primary", width);
        const secondaryHeaderPlane = await createHeaderMesh(canvas, "timeline_header_secondary", secondaryWidth, 0.02, 0.45, "timeline_header_secondary", canvas._theme.secondary_header_bg);

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
            month_0: {
                mesh: janMesh,
                positions: []
            },
            month_1: {
                mesh: febMesh,
                positions: []
            },
            month_2: {
                mesh: marMesh,
                positions: []
            },
            month_3: {
                mesh: aprMesh,
                positions: []
            },
            month_4: {
                mesh: mayMesh,
                positions: []
            },
            month_5: {
                mesh: junMesh,
                positions: []
            },
            month_6: {
                mesh: julMesh,
                positions: []
            },
            month_7: {
                mesh: augMesh,
                positions: []
            },
            month_8: {
                mesh: sepMesh,
                positions: []
            },
            month_9: {
                mesh: octMesh,
                positions: []
            },
            month_10: {
                mesh: novMesh,
                positions: []
            },
            month_11: {
                mesh: decMesh,
                positions: []
            },
            header_plane: {
                mesh: headerPlane,
                positions: []
            },
            secondary_header_plane: {
                mesh: secondaryHeaderPlane,
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

        const startingDay = startDate.getUTCDay();
        if (startingDay < 6) {
            result.secondary_header_plane.positions.push((secondaryWidth / 2) - (startingDay + 1), -0.25, -0.01);

            if (startingDay <= 4) {
                await this.#setSecondaryShapes(result, startDate,  canvas,   0.2, 1.4)
            }
        }

        for (let i = 0; i < numberOfItems; i++) {
            const day = startDate.toLocaleString('en-us', {weekday:'short'})
            const dayNumber = startDate.getDate();
            const utcDay = startDate.getUTCDay();

            result[day.toLowerCase()].positions.push(0.25 + i, -0.8, -0.02);

            result.header_plane.positions.push(0.5 + i, -0.875, -0.01);
            if (utcDay === 6) {
                result.secondary_header_plane.positions.push((secondaryWidth / 2) + (i * width), -0.25, -0.01);
                await this.#setSecondaryShapes(result, startDate,  canvas,  i + 0.2, i + 1.4)
            }

            result[dayNumber].positions.push(0.325 + i, -1.05, -0.01);
            startDate.setUTCDate(startDate.getUTCDate() + 1);
        }

        return result;
    }

    async #setSecondaryShapes(result, startDate, canvas, monthX, yearX) {
        const month = startDate.getMonth();
        result[`month_${month}`].positions.push(monthX, -0.325, -0.01);

        const year = startDate.getFullYear();
        if (result[`year_${year}`] == null) {
            result[`year_${year}`] = {
                positions: [],
                mesh: await createHeaderText(`${year}`, canvas)
            }
        }
        result[`year_${year}`].positions.push(yearX, -0.325, -0.01);
    }
}

class YearHeaderManager {
    getColors(startDate, shape, particle, i, canvas) {
        particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
    }

    async getShapes(startDate, endDate, canvas, rangeProperties, scale) {
        const width = rangeProperties.width;
        const numberOfItems = rangeProperties.items;

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

async function createHeaderMesh(canvas, meshName = "timeline_header", width, offset = 0.02, height = 0.72, matName = "timeline_header", color = canvas._theme.header_bg) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: canvas, mesh: {
            name: meshName, type: "plane", options: {
                width: width - offset, height: height
            }
        }, material: {
            id: matName, color: color,
        }, positions: [{x: 0, y: 0, z: 0}]
    })

    return meshes[0];
}

crs.intent.gfx_timeline_header = HeaderManagerActions;
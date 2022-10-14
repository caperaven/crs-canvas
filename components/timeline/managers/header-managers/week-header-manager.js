import {createHeaderText, createHeaderMesh} from "./header-manager-utils.js";

//Will need to think about the configuration here i.e. user defined work week
export class WeekHeaderManager {
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
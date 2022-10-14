import {createHeaderText, createHeaderMesh} from "./header-manager-utils.js";

//Will need to think about the configuration here i.e. user defined working hours
export class DayHeaderManager {
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
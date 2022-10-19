import {createHeaderText, createHeaderMesh} from "./header-manager-utils.js";

//Will need to think about the configuration here i.e. user defined work week
export class MonthHeaderManager {
    getColors(date, shape, particle, i, canvas) {
        if (shape === "header_plane") {
            const dayNumber = date.getUTCDay();
            if (dayNumber === 5 || dayNumber === 6) {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_offset_bg);
            } else {
                particle.color = BABYLON.Color4.FromHexString(canvas._theme.header_bg);
            }
            date.setUTCDate(date.getUTCDate() + 1);
        }
    }

    async getShapes(baseDate, canvas, rangeProperties, scale) {
        const width = rangeProperties.width;
        const secondaryWidth = width * 7;
        const numberOfItemsToRender = 35;
        // const numberOfItems = rangeProperties.items;

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

        //This is just to render that initial item - won't be necessary with new rendering process
        const baseDay = baseDate.getUTCDay();
        if (baseDay < 6) {
            result.secondary_header_plane.positions.push((secondaryWidth / 2) - (baseDay + 1), -0.25, -0.01);

            if (baseDay <= 4) {
                await this.#setSecondaryShape(result, baseDate,  canvas,  0.2, 1.4)
            }
        }

        //This will probably become a call which the virtualization uses to add items as you scroll
        for (let i = 0; i < numberOfItemsToRender; i++) {
            const day = baseDate.toLocaleString('en-us', {weekday:'short'})
            const dayNumber = baseDate.getDate();
            const utcDay = baseDate.getUTCDay();

            result[day.toLowerCase()].positions.push(0.25 + i, -0.8, -0.02);

            result.header_plane.positions.push(0.5 + i, -0.875, -0.01);
            if (utcDay === 6) {
                result.secondary_header_plane.positions.push((secondaryWidth / 2) + (i * width), -0.25, -0.01);
                await this.#setSecondaryShape(result, baseDate,  canvas,  i + 0.2, i + 1.4)
            }

            result[dayNumber].positions.push(0.325 + i, -1.05, -0.01);
            baseDate.setUTCDate(baseDate.getUTCDate() + 1);

            // await this.setShape(result, baseDate, i, width, secondaryWidth, canvas);
        }

        return result;
    }

    async setShape(particleStore, date, x, width, secondaryWidth, canvas) {
        const day = date.toLocaleString('en-us', {weekday:'short'})
        const dayNumber = date.getDate();
        const utcDay = date.getUTCDay();

        particleStore[day.toLowerCase()].positions.push(0.25 + x, -0.8, -0.02);

        particleStore.header_plane.positions.push(0.5 + x, -0.875, -0.01);
        if (utcDay === 6) {
            particleStore.secondary_header_plane.positions.push((secondaryWidth / 2) + (x * width), -0.25, -0.01);
            await this.#setSecondaryShape(particleStore, date, canvas,  x + 0.2, x + 1.4)
        }

        particleStore[dayNumber].positions.push(0.325 + x, -1.05, -0.01);

        date.setUTCDate(date.getUTCDate() + 1); //This will most likely move out to where the virtualization is calling it, in order to either add 1 or remove 1 depending on if we're scrolling left or right
    }

    async #setSecondaryShape(result, date, canvas, monthX, yearX) {
        const month = date.getMonth();
        result[`month_${month}`].positions.push(monthX, -0.325, -0.01);

        const year = date.getFullYear();
        if (result[`year_${year}`] == null) {
            result[`year_${year}`] = {
                positions: [],
                mesh: await createHeaderText(`${year}`, canvas)
            }
        }
        result[`year_${year}`].positions.push(yearX, -0.325, -0.01);
    }
}

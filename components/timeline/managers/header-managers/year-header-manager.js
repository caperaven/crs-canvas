import {createHeaderText} from "./header-manager-utils.js";

export class YearHeaderManager {
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
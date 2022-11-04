export async function createRect(id, color, x, y, z = 0, width, height, canvas, freezeMatrix) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: canvas,
        mesh: {
            name: id,
            type: "plane",
            options: {width: width, height: height},
        },
        freezeMatrix: freezeMatrix,
        material: {
            color: color
        },
        positions: [{x: x, y: y, z: z}]
    })

    return meshes[0];
}

export async function createHeaderText(text, canvas, x, y, z = 0, scale, bold = false) {
    const min = 0.1;
    const max = 1.25;

    const textMesh = await crs.call("gfx_text", "add",
        {
            element: canvas,
            text: text,
            position: {x: x, y: y, z: z},
            bold: bold,
            attributes: [
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
            ]
        });

    textMesh.scaling = scale
    return textMesh;
}
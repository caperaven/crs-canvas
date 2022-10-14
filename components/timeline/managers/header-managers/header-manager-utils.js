export async function createHeaderText(text, canvas, bold = false) {
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

export async function createHeaderMesh(canvas, meshName = "timeline_header", width, offset = 0.02, height = 0.72, matName = "timeline_header", color = canvas._theme.header_bg) {
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
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

    const textMesh = await crs.call("gfx_text", "add",
        {
            element: canvas,
            text: text,
            position: {x: x, y: y, z: z},
            bold: bold,
            attributes: [
                {
                    fn: "Float",
                    name: "u_buffer",
                    value: 0.5
                },
                {
                    fn: "Float",
                    name: "u_edge",
                    value: 0.5
                }
            ]
        });

    textMesh.scaling = scale
    return textMesh;
}

export async function createBaseDashedLine(camera, scene, scale, canvas) {
    return new Promise((resolve)=> {
        scene.onBeforeRenderObservable.addOnce(async () => {

            const result = await crs.call("gfx_timeline_manager", "get", {
                element: canvas,
                start: new Date(),
                end: new Date(),
                scale:  scale
            });

            const x = result.x2;

            const   points = [
                new BABYLON.Vector3(x, canvas.y_offset / -1, -0.02),
                new BABYLON.Vector3(x, -camera.view_height,  -0.02)
            ];

            const lines =BABYLON.Mesh.CreateDashedLines("dashedLines", points, 1, 1, 50, scene)

            lines.color = BABYLON.Color3.Red();

            camera.onViewMatrixChangedObservable.add((camera)=> {
                lines.position.y = camera.position.y - camera.offset_y ;
            });
            resolve(lines);
        });
    })
}
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

export async function createBaseDashedLine(camera, scene) {
    return new Promise((resolve)=> {
        scene.onBeforeRenderObservable.addOnce(async () => {
            const x = camera.position.x - camera.offset_x;
            const y = camera.view_height;

            const   points = [
                new BABYLON.Vector3(x, -1, -0.2),
                new BABYLON.Vector3(x, -15,  -0.2)
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
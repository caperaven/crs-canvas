export async function configureCamera(canvas) {
    const camera = canvas.__camera;
    const scene = canvas.__layers[0];

    await updateCameraLimits(camera, scene);

    camera.onAfterCheckInputsObservable.add(() => {
        if (camera.cameraDirection.y !== 0) {
            if (camera.position.y >= camera.offset_y) {
                camera.position.y = camera.offset_y;
            }
            if (camera.position.y <= camera.__maxYCamera) {
                camera.position.y = camera.__maxYCamera < camera.offset_y ? camera.__maxYCamera : camera.offset_y;
            }
        }
    });
}


function calculateTangent(adjacent, opposite) {
    return opposite / adjacent;
}

export async function jumpToDate(canvas, baseDate, targetDate, scale) {
    await crs.call("gfx_timeline", "jump_to_date", {element: canvas, base: baseDate, date: targetDate, scale: scale});
}

export async function updateCameraLimits(camera, scene) {
    return new Promise((resolve, reject) => {
        scene.onBeforeRenderObservable.addOnce(() => {
            camera.getViewMatrix();
            const topLeftNormalised = new BABYLON.Vector3(-1, 1, 1)

            // Calculate top_left corner on the far plane. We need it to calculate our tangent
            const pos = BABYLON.Vector3.TransformCoordinates(topLeftNormalised, camera.getTransformationMatrix().invert());

            if (pos.x) {
                const zDistance = pos.z - camera.position.z;
                const tangentX = calculateTangent(zDistance, pos.x);
                const cameraNewX = tangentX * camera.position.z;

                const tangentY = calculateTangent(zDistance, pos.y);
                const cameraNewY = tangentY * camera.position.z;

                camera.offset_x = cameraNewX;
                camera.view_width = cameraNewX * 2;

                console.log(camera.view_width);
                camera.offset_y = cameraNewY;
                camera.view_height = cameraNewY * 2 / -1;

                camera.position.x = cameraNewX;
                camera.position.y = cameraNewY;
            }
            resolve();
        });
    });
}
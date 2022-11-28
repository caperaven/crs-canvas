export async function configureCamera(camera, scene) {
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
            camera.offset_y = cameraNewY;
            camera.view_height = cameraNewY * 2 / -1;

            camera.position.x = cameraNewX;
            camera.position.y = cameraNewY;
        }
    })
}

function calculateTangent(adjacent, opposite) {
    return opposite / adjacent;
}

export async function jumpToDate(canvas, baseDate, targetDate, scale) {
    await crs.call("gfx_timeline", "jump_to_date", {element: canvas, base: baseDate, date: targetDate, scale: scale});
}
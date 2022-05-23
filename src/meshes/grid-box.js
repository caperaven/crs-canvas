BABYLON.MeshBuilder.CreateGridBox = (name, args, scene) => {
    args.sideOrientation = 1
    const box = BABYLON.MeshBuilder.CreateBox("grid_box", args, scene);

    const grid = new BABYLON.GridMaterial("grid", scene);
    grid.gridRatio = args.ratio || 0.2;
    box.material = grid;

    return box;
}
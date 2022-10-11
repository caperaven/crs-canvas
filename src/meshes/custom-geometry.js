BABYLON.MeshBuilder.CreateGeometry = (name, args, scene) => {
   return new Promise((resolve)=> {
    import(`./../geometry-data/${args.data}Data.js`)
        .then(module => {
            const positions = module.data.vertices;
            const indices = module.data.indices;

            const customMesh = BABYLON.MeshBuilder.GeometryFrom(name, {positions, indices}, scene);
            resolve(customMesh);
        })
    });
}

BABYLON.MeshBuilder.GeometryFrom = (name, args, scene) => {
    const customMesh = new BABYLON.Mesh(name, scene);
    const vertexData = new BABYLON.VertexData();
    const normals = [];
    const positions = args.positions;
    const indices = args.indices;

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);

    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.applyToMesh(customMesh);

    if (args.material != null) {
        customMesh.material = args.material;
    }

    if (args.position != null) {
        const x = args.position.x || 0;
        const y = args.position.y || 0;
        const z = args.position.z || 0;
        customMesh.position = new BABYLON.Vector3(x, y, z);
    }

    return customMesh;
}
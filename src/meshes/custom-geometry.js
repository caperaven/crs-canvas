BABYLON.MeshBuilder.CreateGeometry = (name, args, scene) => {
    import(`./../geometry-data/${args.data}Data.js`)
        .then(module => {
            const positions = module.data.vertices;
            const indices = module.data.indices;

            const customMesh = new BABYLON.Mesh(name, scene);
            const vertexData = new BABYLON.VertexData();
            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;
            vertexData.applyToMesh(customMesh);

            if (args.material != null) {
                customMesh.material = args.material;
            }

            // const plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1}, scene);
            // plane.material = args.transparent;

            if (args.position != null) {
                const x = args.position.x || 0;
                const y = args.position.y || 0;
                const z = args.position.z || 0;
                customMesh.position = new BABYLON.Vector3(x, y, z);
                // plane.position = new BABYLON.Vector3(x, y, z + 0.01);
            }

            // BABYLON.Mesh.MergeMeshes([plane, customMesh], true, true, undefined, false, true);
        })
}
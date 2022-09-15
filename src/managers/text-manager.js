export class TextManager {
    constructor(font) {
        this._font = font;
    }

    getFaceVertexData(char) {
        const charData = this._font.chars[char];

        const positions = [
            0, 0, 0,
            1, 0, 0,
            0, 1, 0,
            1, 1, 0,
        ]

        const indices = [0, 1, 2, 1, 3, 2];
        const uvs = [0, 0, 1, 0, 0, 1, 1, 1];
        const normals = [];

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        const data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.uvs = uvs;
        return data;
    }
}
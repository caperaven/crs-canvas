export function getCharData(font, char, pO = 0, ind = 0) {
    const charData = font.chars[char];
    const width = charData.width;
    const height = charData.height;
    const u1 = charData.u1;
    const u2 = charData.u2;
    const v1 = charData.v1;
    const v2 = charData.v2;
    const xoffset = charData.xoffset;
    const yoffset = charData.yoffset;

    const positions = [
        pO + xoffset, yoffset - height, 0,
        pO + width + xoffset, yoffset - height, 0,
        pO + xoffset, yoffset, 0,
        pO + width + xoffset, yoffset, 0
    ]

    const indices = [ind + 0, ind + 1, ind + 2, ind + 1, ind + 3, ind + 2];
    const uvs = [u1, v1, u2, v1, u1, v2, u2, v2];
    const normals = [];

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);

    return {
        positions: positions,
        indices: indices,
        normals: normals,
        uvs: uvs,
        xadvance: charData.xadvance
    }
}
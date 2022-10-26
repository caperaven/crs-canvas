export class HeaderMeshManager {

    static async create(scale, position, index, baseDate, canvas) {
        return this[scale](position, index, baseDate, canvas);
    }

    static async remove(scale, instance) {
        return this[`remove_${scale}`](instance);
    }

    static async day(value) {

    }

    static async week(value) {

    }

    static async month(position, index, baseDate, canvas) {
        const date = new Date(baseDate.getTime());
        date.setDate(date.getDate() + index);

        const dayText = date.toLocaleString('en-us', {day: 'numeric'});

        const instance = {
            dayTextMesh: await createHeaderText(dayText, canvas, position + 0.4, -0.82, canvas._text_scale),
            backgroundMesh: await createRect(dayText, canvas._theme.header_offset_bg, position + 0.5, -0.75, 0.95, 0.5, canvas)
        }
        return instance;
    }

    static async remove_month(instance) {
        instance.dayTextMesh.dispose();
        instance.backgroundMesh.dispose();
    }

    static async year(value) {

    }
}

async function createRect(id, color, x, y, width, height, canvas) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: canvas,
        mesh: {
            id: id,
            type: "plane",
            options: {width: width, height: height},
        },
        material: {
            color: color
        },
        positions: [{x: x, y: y, z: 0}]
    })

    return meshes[0];
}

async function createHeaderText(text, canvas, x, y, scale) {
    const min = 0.1;
    const max = 1.25;

    const textMesh = await crs.call("gfx_text", "add",
        {
            element: canvas,
            text: text,
            position: {x: x, y: y},
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
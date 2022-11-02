/**
 * Examples
 * =============================================================
 * [
 *     "&{code}: ${description}",
 *     "<icon>gear</icon> <bold>[${code}]</bold> ${description}"
 * ]
 */

const attributes = [
    {
        fn: "Float",
        name: "min",
        value: 0.2
    },
    {
        fn: "Float",
        name: "max",
        value: 0.5
    }
];

export class CompositeFactoryActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    //NOTE KR: should we create a grouped mesh?
    /**
     * Create a line from a template string as seen above.
     * The step args is the same as the string system's inflate function
     */
    static async create_line(step, context, process, item) {
        const line = await crs.call("string", "inflate", step.args, context, process, item);
        const canvas = await crs.dom.get_element(step.args.element, context, process, item);
        const position = await crs.process.getValue(step.args.position || {x: 0, y: 0}, context, process, item);
        const parts = getParts(line);

        let bounds = {
            right: 0
        }
        const root = new BABYLON.TransformNode();   //TODO KR: chat with GM/JR as to what is the best way to group a mesh

        let currentX = position.x + 0.25;
        for (const part of parts) {
            const newPos = { x: currentX, y: position.y }

            switch (part.type) {
                case "icon": {
                    const mesh = await createIcon(canvas, part.value, newPos, part.color);
                    bounds = getBounds(mesh);
                    mesh.parent = root;
                    break;
                }
                case "bold": {
                    const mesh = await createSimpleText(canvas, part.value, newPos,true, part.color);
                    bounds = getBounds(mesh);
                    mesh.parent = root;
                    break;
                }
                default: {
                    const mesh = await createSimpleText(canvas, part.value, newPos, false, part.color);
                    bounds = getBounds(mesh);
                    mesh.parent = root;
                    break;
                }
            }

            currentX = bounds.right + 0.25;
        }

        if (line.indexOf("<") == -1) {
            return await createSimpleText(canvas, line, position, false);
        }

        return root;
    }

    static async create_rows(step, context, process, item) {

    }
}

async function createSimpleText(element, text, position, bold, color) {
    position ||= {x: 0, y: 0};

    color = await crs.call("colors", "hex_to_normalised", { hex: color });

    const attr = [
        {
            fn: "Array3",
            name: "color",
            value: [color.r, color.g, color.b]
        },
        ...attributes
    ]

    const mesh = await crs.call("gfx_text", "add", {element, text, position, attributes: attr, bold});
    return mesh;
}

async function createIcon(element, icon, position, color) {
    position ||= {x: 0, y: 0};
    color = await crs.call("colors", "hex_to_normalised", { hex: color });

    const attr = [
        {
            fn: "Array3",
            name: "color",
            value: [color.r, color.g, color.b]
        },
        ...attributes
    ]

    const mesh = await crs.call("gfx_icons", "add", {element, icon, position, attributes: attr, scale: 0.7});
    return mesh;
}

export function getParts(text) {
    const result = [];

    if (text.indexOf("<") == -1) {
        result.push({
            type: "regular",
            value: text,
            color: "#000000ff"
        })

        return result;
    }

    return textToPartsArray(text);
}

function textToPartsArray(text) {
    const resultCollection = [];

    let hasBracket = true;
    let startIndex = 0;
    let endIndex = 0;

    while (hasBracket == true) {
        startIndex = text.indexOf("<", endIndex);
        endIndex = getSecondCloseBracket(text, startIndex);
        const result = text.substring(startIndex, endIndex + 1);
        const value = result.substring(result.indexOf(">", 0) + 1, result.indexOf("<", 5))

        const style = getStyles(result);

        let type;

        if (result.indexOf("<icon") != -1) {
            type = "icon";
        }
        else {
            type = "bold"
        }

        resultCollection.push({
            type: type,
            value,
            color: style.color
        })

        hasBracket = text.indexOf("<", endIndex + 1) != -1;

        if (hasBracket == false) {
            const value = text.substring(endIndex + 1, text.length).trim();
            const style = getStyles(value);

            if (value.length > 0) {
                resultCollection.push({
                    type: "regular",
                    value,
                    color: style.color
                })
            }
        }
    }

    return resultCollection;
}

function getSecondCloseBracket(text, start) {
    const firstClose = text.indexOf(">", start);
    const secondClose = text.indexOf(">", firstClose + 1);
    return secondClose;
}

//TODO KR: Should move to a more general helper/utility file & move some logic out to process api i.e. createClientBoundingRect
export function getBounds(mesh) {
    const result = mesh.getBoundingInfo().boundingBox;
    const min = result.minimumWorld;
    const max = result.maximumWorld;

    const width = max.x - min.x;
    const height = max.y - min.y;

    return {
        x: min.x,
        left: min.x,
        y: min.y,
        top: min.y,
        right: max.x,
        bottom: max.y,
        width: width,
        height: height
    }
}

export function getInverseYBounds(mesh) {
    const result = mesh.getBoundingInfo().boundingBox;
    const min = result.minimumWorld;
    const max = result.maximumWorld;

    const minY = -max.y;
    const maxY = -min.y
    min.y = minY;
    max.y = maxY;

    const width = max.x - min.x;
    const height = max.y - min.y;

    return {
        x: min.x,
        left: min.x,
        y: min.y,
        top: min.y,
        right: max.x,
        bottom: max.y,
        width: width,
        height: height
    }
}

function getStyles(text) {
    const result = {
        color: "#000000ff"
    };

    if (text.indexOf("style") == -1) {
        return result;
    }

    const startIndex = text.indexOf('"', 0) + 1;
    const endIndex = text.indexOf('"', startIndex + 1);
    const parts = text.substring(startIndex, endIndex).split(";");

    for (const part of parts) {
        const sp = part.split(":");
        result[sp[0].trim()] = sp[1].trim();
    }

    if (result.color.length == 7) {
        result.color += "ff";
    }

    return result;
}

crs.intent.gfx_composite = CompositeFactoryActions;
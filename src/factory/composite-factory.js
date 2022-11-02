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

        let newX = 0;

        for (const part of parts) {
            const newPos = { x: newX, y: position.y }

            switch (part.type) {
                case "icon": {
                    const bounds = await createIcon(canvas, part.value, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
                case "bold": {
                    const bounds = await createText(canvas, part.value, true, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
                default: {
                    const bounds = await createText(canvas, part.value, false, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
            }
        }

        if (line.indexOf("<") == -1) {
            return await createText(canvas, line, position, false);
        }
    }

    static async create_rows(step, context, process, item) {

    }
}

async function create(element, color, position, callback) {
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

    const mesh = await callback(position, attr);
    return getBounds(mesh);
}

async function createText(element, text, bold, color, position) {
    return create(element, color, position, async (position, attributes) => {
        return await crs.call("gfx_text", "add", {element, text, position, attributes, bold});
    });
}

async function createIcon(element, icon, color, position) {
    return create(element, color, position, async (position, attributes) => {
        position.x += 0.5;
        return await crs.call("gfx_icons", "add", {element, icon, position, attributes, kerning: true});
    })
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
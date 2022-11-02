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

class CompositeFactory {
    /**
     * Create a line from a template string as seen above.
     */
    static async createLine(canvas, parentNode, template, parameters, position) {
        const line = await crs.call("string", "inflate", {template: template, parameters: parameters});
        const parts = getParts(line);

        let newX = position.x;
        for (const part of parts) {
            const newPos = {x: newX, y: position.y, z: position.z}

            switch (part.type) {
                case "icon": {
                    const bounds = await createIcon(canvas, parentNode, part.value, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
                case "bold": {
                    const bounds = await createText(canvas, parentNode, part.value, true, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
                default: {
                    const bounds = await createText(canvas, parentNode, part.value, false, part.color, newPos);
                    newX += bounds.width + 0.25;
                    break;
                }
            }
        }

        if (line.indexOf("<") == -1) {
            return await createText(canvas, line, position, false);
        }
    }

    /**
     * Create multiple lines from template strings as shown above
     */
    static async createRows(canvas, parentNode, templates, parameters, startingPosition, rowSize, scale) {
        const numberOfLines = templates.length;

        const lineSegmentPosition = (rowSize / (numberOfLines + 1)) / scale.y;
        let currentPositionY = (startingPosition.y / scale.y) + lineSegmentPosition;
        for (const template of templates) {
            await this.createLine(canvas, parentNode, template, parameters,{x: startingPosition.x, y: currentPositionY, z: startingPosition.z});
            currentPositionY -= lineSegmentPosition;
        }
    }
}

export class CompositeFactoryActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async create(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const templates = await crs.process.getValue(step.args.templates, context, process, item);
        const parameters = await crs.process.getValue(step.args.parameters, context, process, item);
        const position = await crs.process.getValue(step.args.position || {x: 0, y: 0, z: 0}, context, process, item);
        const rowSize = await crs.process.getValue(step.args.rowSize || 1, context, process, item);
        const scale = await crs.process.getValue(step.args.scale || new BABYLON.Vector3(1, 1, 1), context, process, item);
        const parentId = await crs.process.getValue(step.args.id || "root", context, process, item);

        const parentNode = new BABYLON.TransformNode(parentId);
        parentNode.scaling.x = scale.x;
        parentNode.scaling.y = scale.y;
        parentNode.scaling.z = scale.z;
        await CompositeFactory.createRows(canvas, parentNode, templates, parameters, position, rowSize, scale);
        return parentNode;
    }
}

async function create(parentNode, element, color, position, callback) {
    position ||= {x: 0, y: 0};
    color = await crs.call("colors", "hex_to_normalised", { hex: color });

    const mesh = await callback(parentNode, position, attributes, color);
    return getBounds(mesh);
}

async function createText(element, parentNode, text, bold, color, position) {
    return create(parentNode, element, color, position, async (parentNode, position, attributes, color) => {
        const mesh = await crs.call("gfx_text", "add", {element, text, position, attributes, bold, color});
        mesh.parent = parentNode;
        return mesh;
    });
}

async function createIcon(element, parentNode, icon, color, position) {
    return create(parentNode, element, color, position, async (parentNode, position, attributes, color) => {
        position.x += 0.5;
        const mesh = await crs.call("gfx_icons", "add", {element, icon, position, attributes, kerning: true, color});
        mesh.parent = parentNode;
        return mesh;
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
        else if (result.indexOf("<bold") != -1) {
            type = "bold"
        }
        else {
            type = "regular"
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
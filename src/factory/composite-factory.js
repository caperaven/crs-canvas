/**
 * Examples
 * =============================================================
 * [
 *     "&{code}: ${description}",
 *     "<icon>gear</icon> <bold>[${code}]</bold> ${description}"
 * ]
 */

export class CompositeFactoryActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    /**
     * Create a line from a template string as seen above.
     * The step args is the same as the string system's inflate function
     */
    static async create_line(step, context, process, item) {
        const line = await crs.call("string", "inflate", step.args, context, process, item);
        const canvas = await crs.dom.get_element(step.args.element, context, process, item);
        const position = await crs.process.getValue(step.args.position, context, process, item);

        if (line.indexOf("<") == -1) {
            return await createSimpleText(canvas, line, position);
        }
    }

    static async create_rows(step, context, process, item) {

    }
}

async function createSimpleText(element, text, position) {
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
    position ||= {x: 0, y: 0};

    await crs.call("gfx_text", "add", {element, text, position, attributes});
}

export function getParts(text) {
    const result = [];

    if (text.indexOf("<") == -1) {
        result.push({
            type: "regular",
            value: text
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
        let type;

        if (result.indexOf("<icon>") != -1) {
            type = "icon";
        }
        else {
            type = "bold"
        }

        resultCollection.push({
            type: type,
            value
        })

        hasBracket = text.indexOf("<", endIndex + 1) != -1;

        if (hasBracket == false) {
            const value = text.substring(endIndex + 1, text.length).trim();
            if (value.length > 0) {
                resultCollection.push({
                    type: "regular",
                    value: value
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

crs.intent.gfx_composite = CompositeFactoryActions;
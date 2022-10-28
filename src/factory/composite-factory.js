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

    return await crs.call("gfx_text", "add", {element, text, position, attributes});
}


crs.intent.gfx_composite = CompositeFactoryActions;
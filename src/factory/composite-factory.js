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
        console.log(line);
    }

    static async create_rows(step, context, process, item) {

    }
}

crs.intent.gfx_composite = CompositeFactoryActions;
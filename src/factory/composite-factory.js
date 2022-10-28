/**
 * Examples
 * =============================================================
 * [
 *     "&{code}: ${description}",
 *     "<icon>gear</icon> <bold>[${code}]</bold> ${description}"
 * ]
 */

export class CompositeFactory {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    /**
     * Create a line from a template string as seen above.
     * The step args is the same as the string system's inflate function
     */
    static async createLine(step, context, process, item) {
        const line = await crs.call("string", "inflate", step.args, context, process, item);
    }

    static async createRows(step, context, process, item) {

    }
}
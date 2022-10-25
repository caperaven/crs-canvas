class TimelineActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

   // TODO GM Add actions we need
    // Render
    // Change scale
    // Jump to date
    // Jump to row
    //
}
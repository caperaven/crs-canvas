class ThemeManager {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async initialize(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas._theme = {}
    }

    static async set(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const theme = await crs.process.getValue(step.args.theme, context, process, item);

        for (const key of Object.keys(theme)) {
            canvas._theme[key] = theme[key];
        }

        if (theme.clearColor != null) {
            canvas.__engine.scenes[0].clearColor = BABYLON.Color3.FromHexString(theme.clearColor);
        }
    }

    static async dispose(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        canvas._theme = null;
    }
}

crs.intent.gfx_theme = ThemeManager;

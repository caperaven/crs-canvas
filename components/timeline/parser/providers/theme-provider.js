export default class ThemeProvider extends crs.classes.BaseProvider  {
    get key() {
        return "theme"
    }

    async process(item, ctx) {
        await super.process(item, ctx);

        await crs.call("gfx_theme", "set", {
            element: ctx.canvas,
            theme: item.theme
        });
    }
}
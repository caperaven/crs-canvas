import {BaseProvider} from "/packages/crs-framework/packages/crs-schema/html/crs-base-provider.js";

export default class ThemeProvider extends BaseProvider {
    get key() {
        return "theme"
    }

    async process(item, ctx) {
        await super.process(item, ctx);

        await crs.call("gfx_theme", "set", {
            element: ctx.canvas,
            theme: item.theme
        });

        console.log(item, ctx);
    }
}
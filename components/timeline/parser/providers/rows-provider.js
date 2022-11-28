import {BaseProvider} from "/packages/crs-framework/packages/crs-schema/html/crs-base-provider.js";

export default class RowsProvider extends BaseProvider {
    get key() {
        return "rows"
    }

    async process(item, ctx) {
        await super.process(item, ctx);

        const config = {
            shapes: item.shapes,
            textTemplates: item.textTemplates
        }
        ctx.setRowConfig(config);
    }
}
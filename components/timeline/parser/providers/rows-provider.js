export default class RowsProvider extends crs.classes.BaseProvider {
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
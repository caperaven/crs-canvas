export default class BodyProvider extends crs.classes.BaseProvider {
    get key() {
        return "body"
    }

    async process(item, ctx) {
        await super.process(item, ctx);
    }
}
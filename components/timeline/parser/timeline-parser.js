import "./../../../packages/crs-framework/packages/crs-schema/crs-schema.js"
import {BaseParser} from "../../../packages/crs-framework/packages/crs-schema/base-parser.js";

import BodyProvider from "./providers/body-provider.js"
import RowsProvider from "./providers/rows-provider.js"
import ThemeProvider from "./providers/theme-provider.js"

export class TimelineParser extends BaseParser {
    #ctx;

    async initialize() {
        await this.register(BodyProvider);
        await this.register(RowsProvider);
        await this.register(ThemeProvider);
    }

    async parse(schema, ctx) {
        this.#ctx = ctx;

        const root = schema["body"];
        await this.providers["body"].process(root, ctx);

        this.#ctx = null;
    }

    async parseChildren(item, ctx) {
        if (item.elements != null) {
            for (const child of item.elements) {
                await this.providers[child.element].process(child, ctx);
            }
        }
    }
}
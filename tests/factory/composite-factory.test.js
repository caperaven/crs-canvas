import { assertEquals, assertExists } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import {describe, it, beforeAll} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import {init} from "./../mockups/init.js";

await init();

beforeAll(async () => {
    globalThis.module = await import("./../../src/factory/composite-factory.js");
})

describe("composite factory tests", async () => {
    let model;

    beforeAll(async() => {
        model = {
            code: "A11",
            description: "A11 description"
        }
    })

    it("get parts", () => {
        const parts = module.getParts("[${code}]: ${description}");
        assertEquals(parts.length, 1);
        assertEquals(parts[0].type, "regular");
        assertEquals(parts[0].value, "[${code}]: ${description}");
    });

    it("get parts - complete", async () => {
        const parts = module.getParts("<icon>gear</icon> <bold>[${code}]</bold> ${description}");
        assertEquals(parts.length, 3);

        assertEquals(parts[0].type, "icon");
        assertEquals(parts[1].type, "bold");
        assertEquals(parts[2].type, "regular");

        assertEquals(parts[0].value, "gear");
        assertEquals(parts[1].value, "[${code}]");
        assertEquals(parts[2].value, "${description}");
    })

    // it("create line", () => {
    //     const result = crs.call("gfx_composite", "create_line", {
    //         template: "${code}: ${description}",
    //         parameters: model
    //     });
    // })
})

import { assertEquals, assertExists } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import {describe, it, beforeAll} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import {init} from "./../mockups/init.js";

await init();

beforeAll(async () => {
    await import("./../../src/factory/composite-factory.js");
})

describe("composite factory tests", async () => {
    let model;

    beforeAll(async() => {
        model = {
            code: "A11",
            description: "A11 description"
        }
    })

    // it("create line", () => {
    //     const result = crs.call("gfx_composite", "create_line", {
    //         template: "${code}: ${description}",
    //         parameters: model
    //     });
    // })
})

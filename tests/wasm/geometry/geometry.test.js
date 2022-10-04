import {
    assertEquals,
    assertStrictEquals,
    assertThrows,
    assertObjectMatch,
    assertNotEquals
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {
    describe,
    it,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach
} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import init, {fill} from "../../../bin/geometry.js";

describe("geometry tests", async () => {

    beforeAll(async () => {
        await init();
    });

    it("can fill a simple path", async () => {
        const result = fill("m,-100,-100,0.0,l,100,-100,0.0,l,100,100,0.0,l,-100,100,0.0,z");
        console.log(result);
    });
});



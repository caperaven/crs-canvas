import {assertEquals} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {describe, it, beforeAll} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import init, {fill} from "../../../bin/geometry.js";

describe("geometry tests", async () => {

    beforeAll(async () => {
        await init();
    });

    it("can fill a square", async () => {
        const res = fill("m,-100,-100,0.0,l,100,-100,0.0,l,100,100,0.0,l,-100,100,0.0,z");
        assertEquals(res.indices, [3, 2, 1, 2, 0, 1]); // [1, 0, 2, 1, 2, 3]);
        assertEquals(res.vertices, [-100, -100, 0, 100, -100, 0, -100, 100, 0, 100, 100, 0]);
        assertEquals(res.aabb, {minX: -100, minY: -100, maxX: 100, maxY: 100});
    });

    it("can fill a triangle", async () => {
        const res = fill("m,-100,-100,0.0, l,0,100,0.0, l,100,-100,0.0,z");

        assertEquals(res.indices, [2, 0, 1]); // [1, 0, 2]);
        assertEquals(res.vertices, [-100, -100, 0, 100, -100, 0, 0, 100, 0]);
        assertEquals(res.aabb, {minX: -100, minY: -100, maxX: 100, maxY: 100});
    });
});



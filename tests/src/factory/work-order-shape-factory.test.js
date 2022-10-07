import {initRequired} from "./../../mockups/init-required.js";
import {
    assertEquals
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {
    describe,
    it,
    beforeAll
} from "https://deno.land/std@0.153.0/testing/bdd.ts";

describe("work order shape factory tests", async () => {

    it("should create a work order duration", async () => {
        // Arrange
        await initRequired();
        await import ("../../../src/factory/work-order-shape-factory.js");
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 2.0,
                maxY: 0.2
            }
        };
        // Act
        const result = await crs.call("gfx_work_order_shape_factory", "work_order_duration", args);

        // Assert
        console.log(result);
    });
});
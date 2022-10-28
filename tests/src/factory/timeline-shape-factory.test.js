import {assertEquals} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {describe, it, beforeAll} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import {init} from "./../../mockups/init.js";

await init();


describe("work order shape factory tests", async () => {

    it("should create a work order duration", async () => {
        // Arrange
        await import ("../../../src/factory/timeline-shape-factory.js");
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 2.0,
                maxY: 0.2
            }
        };
        // Act
        const result = await crs.call("gfx_timeline_shape_factory", "range_indicator", args);

        // Assert
        assertEquals(result, {
                vertices: [
                    0, 0,
                    0, 2,
                    0, 0,
                    0, 0.10000000149011612,
                    0, 0.20000000298023224,
                    0.10000000149011612, 0,
                    1.7999999523162842, 0.10000000149011612,
                    0, 2,
                    0.10000000149011612, 0,
                    0.10000000149011612, 0.20000000298023224,
                    0, 1.899999976158142,
                    0.20000000298023224, 0
                ],
                indices: [
                    7, 4, 5, 5, 4, 1, 4,
                    2, 1, 4, 3, 2, 2, 0,
                    1, 6, 2, 3
                ],
                aabb: {minX: 0, minY: 0, maxX: 2, maxY: 0.20000000298023224}
            }
        )
    });
});
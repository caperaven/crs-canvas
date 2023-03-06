import {assertEquals} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {describe, it, beforeAll} from "https://deno.land/std@0.153.0/testing/bdd.ts";
import {init} from "./../../mockups/init.js";

await init();


const args = {
    aabb: {
        minX: 0.0,
        minY: 0.0,
        maxX: 1.0,
        maxY: 1.0,
        bar_height: 0.4,
        edges: false,

        triangle_height: 0.1,
        triangle_width: 0.1,
        top_triangle: false
    }
}

describe("work order shape factory tests", async () => {

    beforeAll(async () => {
        await import ("../../../src/factory/timeline-shape-factory.js");
    })

    it("should create a work order duration", async () => {
        // Arrange
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
            })
    });

    it("pillar - without edges", async () => {
        // Arrange
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 1.0,
                maxY: 1.0
            },
            bar_height: 1,
            edges: false
        };
        // Act
        const result = await crs.call("gfx_timeline_shape_factory", "pillar", args);

        // Assert
        assertEquals(result, {
            vertices: [
                0, 0, 0,
                1, 0, 0,
                0, 1, 0,
                1, 1, 0
            ],
            indices: [
                3, 2,
                1, 2,
                0, 1
            ],
            aabb: { minX: 0, minY: 0, maxX: 1, maxY: 1 }
        });
    });

    it("pillar - with edges", async () => {
        // Arrange
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 1.0,
                maxY: 1.0
            },
            bar_height: 1,
            edges: true
        };
        // Act
        const results = await crs.call("gfx_timeline_shape_factory", "pillar", args);

        // Assert
        assertEquals(results.length, 3);

        //bar
        assertEquals(results[0], {
            vertices: [
                0, 0, 0,
                1, 0, 0,
                0, 1, 0,
                1, 1, 0
            ],
            indices: [
                3, 2, 1, 2, 0, 1
            ],
            aabb: { minX: 0, minY: 0, maxX: 1, maxY: 1 }
        });

        //left edge
        assertEquals(results[1], {
            vertices: [
                0, 0, 0,
                0.2, 0, 0,
                0, 1, 0,
                0.2, 1, 0
            ],
            indices: [
                3, 2, 1, 2, 0, 1
            ],
            aabb: { minX: 0, minY: 0, maxX: 1, maxY: 1 }
        });
    });

    it("pillar - with edges & bottom triangles", async () => {
        // Arrange
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 0.0,
                maxY: 0.0
            }
        };
        // Act
        const result = await crs.call("gfx_timeline_shape_factory", "", args);

        // Assert
        assertEquals(result, )
    });

    it("pillar - with edges, bottom triangles & top triangles", async () => {
        // Arrange
        const args = {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 0.0,
                maxY: 0.0
            }
        };
        // Act
        const result = await crs.call("gfx_timeline_shape_factory", "", args);

        // Assert
        // assertEquals(result, )
    });
});
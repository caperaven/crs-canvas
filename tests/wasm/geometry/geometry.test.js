// import { assertEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
// import init, {init_panic_hook, line_geometry} from "../../../bin/geometry.js";
//
// await init();
// init_panic_hook();
//
// Deno.test("line_geometry", () => {
//     const result = line_geometry(0, 0, 100, 0);
//     assertEquals(result.vertices.length, 12);
//     assertEquals(result.indices.length, 6);
//     assertEquals(result.aabb.minX, 0);
//     assertEquals(result.aabb.minY, 0);
//     assertEquals(result.aabb.maxX, 100);
//     assertEquals(result.aabb.maxY, 0);
// })
import {init} from "./../../mockups/init.js";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";

await init();

beforeAll(async ()=> {
    await import("../../../src/managers/mesh-position-manager.js");
});

describe("Mesh Position Manager", async () => {
    it("set_relative_position, top", async () => {
        const targetMesh = createMesh("mesh1", 1, 1, {x: 0, y: 0, z: 0});
        const positioningMesh = createMesh("mesh2", 1, 1, {x: 0, y: 0, z: 0});

        console.log(targetMesh, positioningMesh);

    });
});

function createMockMesh(name, width, height, position) {
    const mesh = {
        name: name
    }

    mesh.getBoundingInfo = () => {

    }
}

async function createMesh(name, width, height, position) {
    const meshes = await crs.call("gfx_mesh_factory", "create", {
        element: this.canvas, mesh: {
            name: name, type: "plane", options: {
                width: width, height: height
            }
        }, material: {
            id: "mat1", color: "#939393",
        }, positions: [position]
    })
    return meshes[0];
}
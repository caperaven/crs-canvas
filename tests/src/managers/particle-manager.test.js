import {init} from "./../../mockups/init.js";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";

await init();

beforeAll(async ()=> {
    const module = await import("../../../src/managers/particle-manager.js");
    globalThis.ParticleSystem = module.ParticleSystem;
});

describe("ParticleManager", async () => {
    it("disposeCalled", async () => {
        // Arrange
        globalThis.BABYLON = babylonMock;
        const instance = new ParticleSystem();

        let disposeCalled = false;
        // Act
        const mesh = {
            dispose: ()=> {
                disposeCalled = true;
            }
        };
        instance.add("myId", mesh, 20);

        assertEquals(disposeCalled, true)
    });


});

const babylonMock = Object.freeze({
    SolidParticleSystem: class SolidParticleSystem {
        constructor(id) {
            this.id = id;
            this.shapeIds = [];
        }

        addShape() {
            const id = crypto.randomUUID();
            this.shapeIds.push(id);
            return id;
        }
    }
});


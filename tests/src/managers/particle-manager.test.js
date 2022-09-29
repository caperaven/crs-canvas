import {initRequired} from "./../../mockups/init-required.js";

import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";


beforeAll(async ()=> {

    const {
        default: myDefault,
        foo,
        bar,
    } = await import("../../../src/managers/particle-manager.js");
})


describe("ParticleManager", async () => {

    await initRequired();
    it("should allow undefined as value", async () => {
        // Arrange
        globalThis.BABYLON = babylonMock;
        const instance = new ParticleSystem();


        // Act
        const mesh = {};
        instance.add("myId", mesh, 20);
        // Assert
        assertEquals(instance.indeterminate, true);
        assertEquals(instance.ariaChecked, "mixed");
        assertEquals(instance.checked, null);
    });


});

const babylonMock = Object.freeze({
    SolidParticleSystem: class SolidParticleSystem {
        constructor(id) {
            this.id = id;
        }
    }
});


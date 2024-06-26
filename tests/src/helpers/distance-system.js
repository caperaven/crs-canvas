import {assertEquals} from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {beforeEach, afterEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import {DistanceSystem} from "../../../src/helpers/distance-system.js";

let instance;

const multiplier = 3;
const shapes = [{key: "shape1", count: multiplier}, {key: "shape2", count: multiplier}];
beforeEach(async () => {
    instance = new DistanceSystem(shapes);
});

afterEach(async () => {
    instance.dispose();
});

describe("DistanceSystem", async () => {
    it("getIndex - simple", async () => {

        instance.set(shapes[0].key, 0, 10);
        instance.set(shapes[0].key, 1, 15);
        instance.set(shapes[0].key, 2, 5);

        const result = instance.getIndex(shapes[0].key, 0);
        assertEquals(result, 1)
    });

    it("getIndex - complex", async () => {

        instance.set(shapes[0].key, 1, 10);
        instance.set(shapes[0].key, 2, 11);
        instance.set(shapes[0].key, 0, 12);

        const result = instance.getIndex(shapes[0].key, 0);
        assertEquals(result, 0)
    });

    it("getIndex - complex decimal", async () => {

        instance.set(shapes[0].key, 1, 10.588);
        instance.set(shapes[0].key, 2, 10.589);
        instance.set(shapes[0].key, 0, 10.587);

        const result = instance.getIndex(shapes[0].key, 0);
        assertEquals(result, 2)
    });

    it("getIndex - complex minus", async () => {

        instance.set(shapes[0].key, 1, -4);
        instance.set(shapes[0].key, 2, 6);
        instance.set(shapes[0].key, 0, -6);

        const result = instance.getIndex(shapes[0].key, -5);
        assertEquals(result, 2)
    });

    it("getIndex - if position already set return that index", async () => {

        instance.set(shapes[0].key, 0, 0);
        instance.set(shapes[0].key, 1, -5);
        instance.set(shapes[0].key, 2, 6);


        const result = instance.getIndex(shapes[0].key, -5);
        assertEquals(result, 1)
    });


    it("getIndex - if 2 positions not set return first empty", async () => {

        instance.set(shapes[0].key, 0, 5);


        const result = instance.getIndex(shapes[0].key, 4);
        assertEquals(result, 1)
    });

    it("getIndex - if 1 positions not set return last", async () => {

        instance.set(shapes[0].key, 0, 5);
        instance.set(shapes[0].key, 1, 6);


        const result = instance.getIndex(shapes[0].key, 4);
        assertEquals(result, 2)
    });


    it("has - true", async () => {

        instance.set(shapes[0].key, 0, 5);
        instance.set(shapes[0].key, 1, 6);


        const result = instance.has(shapes[0].key, 5);
        assertEquals(result, true)
    });

    it("has - false", async () => {

        instance.set(shapes[0].key, 0, 5);
        instance.set(shapes[0].key, 1, 6);


        const result = instance.has(shapes[0].key, 8);
        assertEquals(result, false)
    });

    it("minus - get largest minus number ", async () => {

        instance.set(shapes[0].key, 0, -10);
        instance.set(shapes[0].key, 1, -100);
        instance.set(shapes[0].key, 2, -20);


        const result = instance.getIndex(shapes[0].key, -101);
        assertEquals(result, 0)
    });
});
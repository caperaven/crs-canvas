import {TimelineActions} from "./../../../components/timeline/timeline-actions.js";
import { assertEquals, assertExists } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import {init} from "./../../mockups/init.js";

await init();

Deno.test("TimelineActions:perform", async () => {
    const step = {
        action: "go_to_selected"
    }
    const context = {};
    const process = {};
    const item = {};

    const result = await TimelineActions.perform(step, context, process, item);
    assertEquals(result, undefined);
});

Deno.test("TimelineActions:go_to_selected", async () => {
    const step = {
        args: {
            field: "test_field"
        }
    }
    const context = {};
    const process = {};
    const item = {};

    const selected = {
        index: 0,
        item: {
            test_field: new Date()
        }
    }

    globalThis.crs = {
        dom: {
            get_element: async () => {
                return {
                    canvas: {},
                    baseDate: new Date(),
                    scale: 1
                }
            }
        },
        process: {
            getValue: async (value) => {
                return value;
            }
        }
    }

    const result = await TimelineActions.go_to_selected(step, context, process, item);
    assertEquals(result, undefined);
});
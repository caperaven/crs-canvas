import { assertEquals, assertExists } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import {initRequired} from "./../../../mockups/init-required.js";

const data = [
    {
        id: "1 hour",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy: new Date(Date.UTC(2022, 0, 1, -1))
    },
    {
        id: "6 hours",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 1, 4))
    },
    {
        id: "12 hours",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 1, 10))
    },
    {
        id: "18 hours",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 1, 16))
    },
    {
        id: "24 hours/1 day",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 2, -2))
    },
    {
        id: "3 days",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 4, -2))
    },
    {
        id: "5 days",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 6, -2))
    },
    {
        id: "7 days",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 0, 8, -2))
    },
    {
        id: "1 month (Jan)",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 1, 1, -2))
    },
    {
        id: "1 year",
        receivedOn: new Date(Date.UTC(2022, 0, 1, -2)),
        requiredBy:  new Date(Date.UTC(2023, 0, 1, -2))
    },
    {
        id: "1 month (FEB)",
        receivedOn: new Date(Date.UTC(2022, 1, 1, -2)),
        requiredBy:  new Date(Date.UTC(2022, 2, 1, -2))
    }
]

const setup = async () => {
    await initRequired();
    await import("./../../../../components/timeline/managers/timeline-manager.js");

    globalThis.canvas = globalThis.document.createElement("canvas");
    globalThis.minDate = new Date(Date.UTC(2022, 0, 1, -2));
    globalThis.maxDate = new Date(Date.UTC(2023, 0, 1, -2));

    await crs.call("gfx_timeline_manager", "initialize", {element: globalThis.canvas, min: globalThis.minDate, max: globalThis.maxDate});
}

await setup();

//set_scale - day view
Deno.test("timeline_manager, setScale, plotting 1 hour in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[0].receivedOn, max: data[0].requiredBy, scale: "day"});
    assertEquals(result.items, 1);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 6 hours in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[1].receivedOn, max: data[1].requiredBy, scale: "day"});
    assertEquals(result.items, 6);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 12 hours in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[2].receivedOn, max: data[2].requiredBy, scale: "day"});
    assertEquals(result.items, 12);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 18 hours in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[3].receivedOn, max: data[3].requiredBy, scale: "day"});
    assertEquals(result.items, 18);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting a day in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[4].receivedOn, max: data[4].requiredBy, scale: "day"});
    assertEquals(result.items, 24);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 3 days in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[5].receivedOn, max: data[5].requiredBy, scale: "day"});
    assertEquals(result.items, 72);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 5 days in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[6].receivedOn, max: data[6].requiredBy, scale: "day"});
    assertEquals(result.items, 120);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 7 days in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[7].receivedOn, max: data[7].requiredBy, scale: "day"});
    assertEquals(result.items, 168);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 1 month (JAN) in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[8].receivedOn, max: data[8].requiredBy, scale: "day"});
    assertEquals(result.items, 744);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting 1 year in day view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[9].receivedOn, max: data[9].requiredBy, scale: "day"});
    assertEquals(result.items, 8760);
    assertEquals(result.width, 1);
})


//set_scale, week view
Deno.test("timeline_manager, setScale, plotting a 5 day week in week view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[6].receivedOn, max: data[6].requiredBy, scale: "week"});
    assertEquals(result.items, 5);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting a 7 day week in week view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[7].receivedOn, max: data[7].requiredBy, scale: "week"});
    assertEquals(result.items, 7);
    assertEquals(result.width, 1);
})


//set_scale, month view
Deno.test("timeline_manager, setScale, plotting a month (JAN) in month view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[8].receivedOn, max: data[8].requiredBy, scale: "month"});
    assertEquals(result.items, 31);
    assertEquals(result.width, 1);
})

Deno.test("timeline_manager, setScale, plotting a month (FEB) in month view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[10].receivedOn, max: data[10].requiredBy, scale: "month"});
    assertEquals(result.items, 28);
    assertEquals(result.width, 1);
})


//set_scale, year view
Deno.test("timeline_manager, setScale, plotting a year in year view", async () => {
    const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[9].receivedOn, max: data[9].requiredBy, scale: "year"});
    assertEquals(result.items, 12);
    assertEquals(result.width, 1); //TODO KR: check width value
})
import { assertEquals, assertExists } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import {init} from "./../../../mockups/init.js";

await init();

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
    await import("./../../../../components/timeline/managers/timeline-manager.js");

    globalThis.canvas = globalThis.document.createElement("canvas");
    globalThis.baseDate = new Date(Date.UTC(2022, 0, 1, -2));

    await crs.call("gfx_timeline_manager", "initialize", {element: globalThis.canvas, base: globalThis.baseDate});
}

await setup();

Deno.test("timeline_manager, year - get, retrieving x1, x2, width of 1 month previous", async () => {
    const result = await crs.call("gfx_timeline_manager", "get", {element: globalThis.canvas, start: new Date(Date.UTC(2021, 11, 1, -2)), end: globalThis.baseDate, scale: "year"});
    assertEquals(result.x1, -3.0575342465753423);
    assertEquals(result.x2, 0);
    assertEquals(result.width, 3.0575342465753423);
})

Deno.test("timeline_manager, year - get, retrieving x1, x2, width of 1 month forward", async () => {
    const result = await crs.call("gfx_timeline_manager", "get", {element: globalThis.canvas, start: globalThis.baseDate, end: new Date(Date.UTC(2022, 1, 1, -2)), scale: "year"});
    assertEquals(result.x1, 0);
    assertEquals(result.x2, 3.0575342465753423);
    assertEquals(result.width, 3.0575342465753423);
})

//TODO KR: Need to update tests for new timeline-manager logic
// //set_scale - day view
// Deno.test("timeline_manager, setScale, plotting 1 hour in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[0].receivedOn, max: data[0].requiredBy, scale: "day"});
//     assertEquals(result.items, 2);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 2);
// })
//
// Deno.test("timeline_manager, setScale, plotting 6 hours in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[1].receivedOn, max: data[1].requiredBy, scale: "day"});
//     assertEquals(result.items, 12);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 12);
// })
//
// Deno.test("timeline_manager, setScale, plotting 12 hours in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[2].receivedOn, max: data[2].requiredBy, scale: "day"});
//     assertEquals(result.items, 24);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 24);
// })
//
// Deno.test("timeline_manager, setScale, plotting 18 hours in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[3].receivedOn, max: data[3].requiredBy, scale: "day"});
//     assertEquals(result.items, 36);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 36);
// })
//
// Deno.test("timeline_manager, setScale, plotting a day in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[4].receivedOn, max: data[4].requiredBy, scale: "day"});
//     assertEquals(result.items, 48);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 48);
// })
//
// Deno.test("timeline_manager, setScale, plotting 3 days in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[5].receivedOn, max: data[5].requiredBy, scale: "day"});
//     assertEquals(result.items, 144);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 144);
// })
//
// Deno.test("timeline_manager, setScale, plotting 5 days in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[6].receivedOn, max: data[6].requiredBy, scale: "day"});
//     assertEquals(result.items, 240);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 240);
// })
//
// Deno.test("timeline_manager, setScale, plotting 7 days in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[7].receivedOn, max: data[7].requiredBy, scale: "day"});
//     assertEquals(result.items, 336);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 336);
// })
//
// Deno.test("timeline_manager, setScale, plotting 1 month (JAN) in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[8].receivedOn, max: data[8].requiredBy, scale: "day"});
//     assertEquals(result.items, 1488);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 1488);
// })
//
// Deno.test("timeline_manager, setScale, plotting 1 year in day view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[9].receivedOn, max: data[9].requiredBy, scale: "day"});
//     assertEquals(result.items, 17520);
//     assertEquals(result.width, 1);
//     assertEquals(result.totalWidth, 17520);
// })
//
//
// //set_scale, week view
// Deno.test("timeline_manager, setScale, plotting a 5 day week in week view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[6].receivedOn, max: data[6].requiredBy, scale: "week"});
//     assertEquals(result.items, 5);
//     assertEquals(result.width, 4);
//     assertEquals(result.totalWidth, 20);
// })
//
// Deno.test("timeline_manager, setScale, plotting a 7 day week in week view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[7].receivedOn, max: data[7].requiredBy, scale: "week"});
//     assertEquals(result.items, 7);
//     assertEquals(result.width, 4);
//     assertEquals(result.totalWidth, 28);
// })
//
//
// //set_scale, month view
// Deno.test("timeline_manager, setScale, plotting a month (JAN) in month view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[8].receivedOn, max: data[8].requiredBy, scale: "month"});
//     assertEquals(result.items, 31);
//     assertEquals(result.width, 1);
// })
//
// Deno.test("timeline_manager, setScale, plotting a month (FEB) in month view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[10].receivedOn, max: data[10].requiredBy, scale: "month"});
//     assertEquals(result.items, 28);
//     assertEquals(result.width, 1);
// })
//
//
// //set_scale, year view
// Deno.test("timeline_manager, setScale, plotting a year in year view", async () => {
//     const result = await crs.call("gfx_timeline_manager", "set_range", {element: globalThis.canvas, min: data[9].receivedOn, max: data[9].requiredBy, scale: "year"});
//     assertEquals(result.items, 12);
//     assertEquals(result.width[0], 3.0575342465753423);
//     assertEquals(result.width[1], 2.761643835616438);
//     assertEquals(result.width[2], 3.0575342465753423);
//     assertEquals(result.width[3], 2.958904109589041);
//     assertEquals(result.width[4], 3.0575342465753423);
//     assertEquals(result.width[5], 2.958904109589041);
//     assertEquals(result.width[6], 3.0575342465753423);
//     assertEquals(result.width[7], 3.0575342465753423);
//     assertEquals(result.width[8], 2.958904109589041);
//     assertEquals(result.width[9], 3.0575342465753423);
//     assertEquals(result.width[10], 2.958904109589041);
//     assertEquals(result.width[11], 3.0575342465753423);
// })
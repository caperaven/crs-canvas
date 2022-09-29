import {ElementMock, mockElement} from "./element.mock.js"
import {DocumentMock} from "./dom-mock.js";
import "./computed-style-mock.js";

globalThis.HTMLElement = ElementMock;
globalThis.HTMLInputElement = ElementMock;
globalThis.mockElement = mockElement;
globalThis.elementRegistry = {}

globalThis.customElements = {
    define(id, className, options) {
        globalThis.elementRegistry[id] = className;
    }
}

globalThis.requestAnimationFrame = (callback) => callback();

export async function initRequired() {
    globalThis.HTMLElement = ElementMock;
    globalThis.DocumentFragment = ElementMock;

    globalThis.customElements = {
        define: () => {return null}
    }

    globalThis.document = new DocumentMock();
    globalThis.document.body = {
        dataset: {}
    }

    await import("./../../packages/crs-binding/crs-binding.js");
    await import("./../../packages/crs-modules/crs-modules.js");
    const processModule = await import("./../../packages/crs-process-api/crs-process-api.js");
    await processModule.initialize("./../../packages/crs-process-api");
}
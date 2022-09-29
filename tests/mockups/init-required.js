import {ElementMock} from "./element.mock.js"
import {DocumentMock} from "./dom-mock.js";


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
    const processAPI = await import("./../../packages/crs-process-api/crs-process-api.js");

    //initialize crs-process-api
   await processAPI.initialize("./../../packages/crs-process-api");
}
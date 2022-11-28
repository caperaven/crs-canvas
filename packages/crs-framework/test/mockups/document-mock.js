import {ElementMock, mockElement} from "./element-mock.js"
import {createMockChildren} from "./child-mock-factory.js";

globalThis.document = new ElementMock("document");
globalThis.document.body = new ElementMock("body");
globalThis.document.documentElement = globalThis.document.body;

globalThis.document.createElement = (tag, html) => {
    if (globalThis.__elementRegistry[tag] != null) {
        let result = mockElement(new globalThis.__elementRegistry[tag]());

        if (result.load != null) {
            const load = result.load;
            result.load = async () => {
                createMockChildren(result);
                await load.call(result);
            }
        }

        return result;
    }

    return new ElementMock(tag);
}

globalThis.document.createTextNode = () => {
    return new ElementMock("text");
}

globalThis.document.createDocumentFragment = () => {
    return new ElementMock();
}

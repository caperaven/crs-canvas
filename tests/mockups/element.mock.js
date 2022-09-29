export function mockElement(instance, tagName, name) {
    instance.variables = {};
    instance.attributes = [];
    instance.queryResults = new Map();
    instance.events = new Map();
    instance.textContent = "";
    instance.innerText = "";
    instance.innerHTML = "";
    instance.content = instance;
    instance.children = [];
    instance.classList = new ClassList();
    instance.dataset = {};

    instance.nodeName = (tagName || "div").toUpperCase();
    instance.name = name;
    instance.style = {
        gridTemplateColumns: "",
        gridTemplateRows: ""
    };

    instance.getAttribute = (attr) => {
        return instance.attributes.find(item => item.name == attr);
    }

    instance.setAttribute =(attr, value) => {
        const attrObj = {
            name: attr,
            value: value,
            ownerElement: instance
        };

        instance.attributes.push(attrObj);
    }

    instance.removeAttribute = (attr, value) => {
        const attrObj = instance.getAttribute(attr);
        const index = instance.attributes.indexOf(attrObj);
        instance.attributes.splice(index, 1);
    }

    instance.querySelector = (selector) => {
        return instance.queryResults.get(selector);
    }

    instance.querySelectorAll = (selector) => {
        return [instance.querySelector(selector)];
    }

    instance.cloneNode = () => {
        return instance;
    }

    instance.appendChild = (element) => {
        instance.children.push(element);
        return instance;
    };

    instance.removeChild = (child) => {
        const index = instance.children.indexOf(child);
        if (index != -1) {
            instance.children.splice(index, 1);
        }
        return instance;
    }

    instance.addEventListener = (event, callback) => {
        instance.events.set(event, callback);
    }

    instance.removeEventListener = (event, callback) => {
        instance.events.delete(event);
    }

    instance.insertBefore = (element, oldElement) => {
    }

    instance.dispatchEvent = (event, args) => {
        instance.events[event]?.(args);
    }

    return instance;
}



export class ElementMock {
    constructor(tagName, name) {
        mockElement(this, tagName, name);
    }
}

class ClassList {
    get length() {
        return this.items.length;
    }

    constructor() {
        this.items = [];
    }

    add(item) {
        if (Array.isArray(item)) {
            for (let i of item) {
                this.items.push(i);
            }
        }
        this.items.push(item);
    }

    contains(item) {
        const result = this.items.find(cls => cls == item);
        return result != null;
    }

    remove(item) {
        const index = this.items.indexOf(item);
        if (index != -1) {
            this.items.splice(index, 1);
        }
    }

    item(index) {
        return this.items[index];
    }
}
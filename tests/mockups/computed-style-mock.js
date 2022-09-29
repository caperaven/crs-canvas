export class ComputedStyleMock {
    constructor(element) {
        this.element = element;
    }

    getPropertyValue(variable) {
        return this.element.variables[variable];
    }

    setProperty(variable, value) {
        this.element.variables[variable] = value;
    }
}

globalThis.getComputedStyle = (element) => {
    return new ComputedStyleMock(element);
}
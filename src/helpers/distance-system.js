export class DistanceSystem {
    #shapes;

    constructor(shapes, multiplier) {
        this.#shapes = {};
        for (const key of shapes) {
            this.#shapes[key] = new Array(multiplier)
        }
    }

    dispose() {
        this.#shapes = null;
    }

    set(shapeKey, index, position) {
        this.#shapes[shapeKey][index] = position;
    }

    has(shapeKey, position) {
        for (const shapePosition of this.#shapes[shapeKey]) {
            if(position === shapePosition) return true;
        }
        return false;
    }

    /**
     * This will return the furthest away index based on position supplied.
     */
    getIndex(shapeKey, position) {
        let positions = this.#shapes[shapeKey];

        let furthestDistance = 0;
        let furthestIndex;

        for (let i = 0; i < positions.length; i++) {

            // If instance exist at position return that index. This prevents duplicate rendering on same position.
            if(positions[i] === position) return i;

            // If index has not been used before use that index;
            if(positions[i] == null) return i;

            const distance =  Math.abs(positions[i] - position);
            if (distance > furthestDistance) {
                furthestDistance = distance;
                furthestIndex = i;
            }
        }

        return furthestIndex;
    }

    #getDistance(num1, num2) {
        if (num1 > num2) {
            return num1 - num2
        } else {
            return num2 - num1
        }
    }
}

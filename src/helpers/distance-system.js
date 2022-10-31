export class DistanceSystem {
    #shapes;

    constructor(shapes) {
        this.#shapes = {};
        for (const shape of shapes) {
            this.#shapes[shape.key] = new Array(shape.count)
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
}

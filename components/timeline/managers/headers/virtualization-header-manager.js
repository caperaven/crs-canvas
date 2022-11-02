import "../../../../src/managers/mesh-factory-manager.js";
import "../../../../src/managers/particle-manager.js";
import "../../../../src/managers/text-manager.js";
import {TIMELINE_SCALE} from "../../timeline-scale.js";
import {createRect} from "../timeline-helpers.js";
import {ParticleHeader} from "./particle-header.js";

export class VirtualizationHeaderManager {
    #bgBorderMesh;
    #cameraObserver;
    #headers;

    dispose(canvas) {
        this.#bgBorderMesh = this.#bgBorderMesh.dispose();
        this.#removeCameraObserver(canvas);
        this.removeHeaders();
    }

    removeHeaders() {
        for (const header of this.#headers) {
            header.dispose();
        }
        this.#headers = null;
    }

    async createHeaders(baseDate, scale, canvas) {
        this.#headers = await HeaderFactory[scale](baseDate, scale, canvas);
    }

    async init(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;

        scene.onBeforeRenderObservable.addOnce(async () => {
            this.#bgBorderMesh = await createRect("header_bg", canvas._theme.header_offset_bg, canvas.__camera.offset_x, -0.51, 9999999, 1.02, canvas, false);
            this.#bgBorderMesh.position.z = -0.002;


            await this.createHeaders(baseDate, scale, canvas);
            if (this.#cameraObserver == null) {
                this.#addCameraObserver(canvas);
            }
        });
    }

    #addCameraObserver(canvas) {
        this.#cameraObserver = canvas.__camera.onViewMatrixChangedObservable.add(async (camera) => {
            const position = camera.position.x - camera.offset_x;
            this.#bgBorderMesh.position.y = camera.position.y - 0.51 - camera.offset_y;

            for (const header of this.#headers) {
                await header.draw(position);
            }
        });
    }

    #removeCameraObserver() {
        canvas.__camera.onViewMatrixChangedObservable.remove(this.#cameraObserver);
        this.#cameraObserver = null;
    }
}

class HeaderFactory {
    static async day(baseDate, scale, canvas) {
        const result = await this.year(baseDate, scale, canvas, TIMELINE_SCALE.DAY);
        const dayHeader = new ParticleHeader();
        await dayHeader.init(baseDate, scale, canvas);

        result.push(dayHeader);
        return result
    }

    static async week(baseDate, scale, canvas) {
        const result = await this.year(baseDate, scale, canvas, TIMELINE_SCALE.WEEK);
        const weekHeader = new ParticleHeader();
        await weekHeader.init(baseDate, scale, canvas);

        result.push(weekHeader);
        return result
    }

    static async month(baseDate, scale, canvas) {
        const result = await this.year(baseDate, scale, canvas, TIMELINE_SCALE.MONTH);
        const monthHeader = new ParticleHeader();
        await monthHeader.init(baseDate, scale, canvas);

        result.push(monthHeader);
        return result
    }

    static async year(baseDate, scale, canvas, relativeScale = TIMELINE_SCALE.YEAR) {
        const yearHeader = new ParticleHeader();
        await yearHeader.init(baseDate, "year", canvas, relativeScale);

        return [yearHeader]
    }
}
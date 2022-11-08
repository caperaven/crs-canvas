import "../../../../src/managers/mesh-factory-manager.js";
import "../../../../src/managers/particle-manager.js";
import "../../../../src/managers/text-manager.js";
import {TIMELINE_SCALE} from "../../timeline-scale.js";
import {createRect} from "../timeline-helpers.js";
import {ParticleHeader} from "./particle-header.js";

export class VirtualizationHeaderManager {
    #bgBorderMesh;
    #splittingBorder
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

        this.#bgBorderMesh?.dispose();
        this.#bgBorderMesh = null;

        this.#splittingBorder?.dispose();
        this.#splittingBorder = null;
    }

    async createHeaders(baseDate, scale, canvas) {
        this.#headers = await HeaderFactory[scale](baseDate, scale, canvas);

        const height = canvas.__offsets.get("y", scale !== TIMELINE_SCALE.YEAR ? "default_header" : "year_header");
        this.#bgBorderMesh = await createRect("header_bg", canvas._theme.header_offset_bg, canvas.__camera.offset_x, (-height / 2), canvas.__zIndices.bgBorderMesh, 9999999, height, canvas, false);
        this.#bgBorderMesh.height = height;
        this.#bgBorderMesh.position.y = camera.position.y - (this.#bgBorderMesh.height / 2) - camera.offset_y;
        this.#bgBorderMesh.enableEdgesRendering();
        this.#bgBorderMesh.edgesWidth = 1.0;
        this.#bgBorderMesh.edgesColor = BABYLON.Color4.FromHexString(canvas._theme.header_border);

        if (scale !== TIMELINE_SCALE.YEAR) {
            await this.#createSplittingBorder(canvas);
        }
    }

    async init(baseDate, scale, canvas, scene) {
        scale = scale || TIMELINE_SCALE.MONTH;

        scene.onBeforeRenderObservable.addOnce(async () => {
            await this.createHeaders(baseDate, scale, canvas);
            if (this.#cameraObserver == null) {
                this.#addCameraObserver(canvas);
            }
        });
    }

    #addCameraObserver(canvas) {
        this.#cameraObserver = canvas.__camera.onViewMatrixChangedObservable.add(async (camera) => {
            const position = camera.position.x - camera.offset_x;
            this.#bgBorderMesh.position.y = camera.position.y - camera.offset_y - ((this.#bgBorderMesh.height / 2));
            if (this.#splittingBorder != null) this.#splittingBorder.position.y = camera.position.y - camera.offset_y - 0.5;

            for (const header of this.#headers) {
                await header.draw(position);
            }
        });
    }

    #removeCameraObserver(canvas) {
        canvas.__camera.onViewMatrixChangedObservable.remove(this.#cameraObserver);
        this.#cameraObserver = null;
    }

    async #createSplittingBorder(canvas) {
        this.#splittingBorder = BABYLON.MeshBuilder.CreateLines("lines", {
            points: [
                new BABYLON.Vector3(-999, 0, 0),
                new BABYLON.Vector3(999, 0, 0),
            ],
            colors: [
                BABYLON.Color4.FromHexString(canvas._theme.header_border),
                BABYLON.Color4.FromHexString(canvas._theme.header_border)
            ],
            updatable: true
        });
        this.#splittingBorder.position.y = -0.5;
        this.#splittingBorder.position.z = canvas.__zIndices.bgBorderMesh;
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
import {getInverseYBounds} from "../factory/composite-factory.js";

class MeshPositionManager {
    static async setRelativePosition (positioningMesh, targetMesh, at, anchor, margin) {
        //calls process API fixed-layout-actions system to position mesh relative to another
        positioningMesh.style = {};
        positioningMesh.removeAttribute = () => {};
        //TODO KR: how to get around dom.getElement call for both meshes
        positioningMesh._dataId = positioningMesh._dataId || -1;
        targetMesh._dataId = targetMesh._dataId || -1;
        this.#setMeshBounds(positioningMesh);
        this.#setMeshBounds(targetMesh);

        await crs.call("fixed_layout", "set", {
            element: positioningMesh,
            target: targetMesh,
            at: at,
            anchor: anchor,
            margin: margin,
            ensureInFrustum: false
        })

        const transform = this.#extractTransform(positioningMesh);
        this.#applyTranslations(positioningMesh, transform);
    }

    static #setMeshBounds(mesh) {
        const meshBounds = getInverseYBounds(mesh);
        mesh.getBoundingClientRect = () => {
            const result = {
                bounds: meshBounds
            }

            return result.bounds;
        }
    }

    static #applyTranslations(mesh, transform) {
        const bounds = mesh.getBoundingClientRect();
        mesh.position.x = transform.x;
        mesh.position.y = -transform.y - bounds.height;
    }

    static #extractTransform(mesh) {
        const result = {x: 0, y: 0}
        if (mesh?.style?.translate == null) return result;

        const parts = mesh.style.translate.split(" ");
        result.x = Number.parseFloat(parts[0].replace("px", ""));
        result.y = Number.parseFloat(parts[1].replace("px", ""));

        return result;
    }
}

class MeshPositionManagerActions {
    static async set_relative_position (step, context, process, item) {
        //calls process API fixed-layout-actions system to position mesh relative to another
        const positioningMesh = await crs.process.getValue(step.args.mesh, context, process, item);
        const targetMesh = await crs.process.getValue(step.args.target, context, process, item);
        const at = (await crs.process.getValue(step.args.at || "bottom", context, process, item));
        const anchor = (await crs.process.getValue(step.args.anchor, context, process, item));
        const margin = await crs.process.getValue(step.args.margin || 0, context, process, item);
        await MeshPositionManager.setRelativePosition(positioningMesh, targetMesh, at, anchor, margin);
    }


}

crs.intent.gfx_mesh_position = MeshPositionManagerActions;
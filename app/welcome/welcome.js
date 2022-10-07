import "./../../src/managers/geometry-factory-manager.js";

export default class Welcome extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        const canvas = this.element.querySelector("canvas");

        const ready = () => {
            canvas.removeEventListener("ready", ready);
            this.addMeshes(canvas);
        }

        if (canvas.dataset.ready == "true") {
            ready();
        } else {
            canvas.addEventListener("ready", ready);
        }
    }


    async addMeshes(canvas) {
        canvas.__layers[0].onPointerDown = (event, pickResult) => {
            console.log(pickResult.pickedMesh)
        }

        // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), canvas.__layers[0]);
        // light.intensity = 1;

        // const box = BABYLON.MeshBuilder.CreateGridBox("grid", {size: 16, ratio: 1}, canvas.__layers[0]);
        // box.position.y = 2.5;
        // BABYLON.MeshBuilder.CreateBox("box", {size: 1}, canvas.__layers[0]);

        //crs.call("gfx_geometry", "add", { element: canvas, data: "icons/home", position: {x: -1, y: 1}, color: "#ff0090" });
        // crs.call("gfx_geometry", "add", { element: canvas, data: "flowchart/documents", position: {x: 1, y: 1}, color: "#ff9000" });
        // crs.call("gfx_geometry", "add", { element: canvas, data: "floorplan/fire_hose", position: {x: 1, y: -1}, color: "#9000ff" });

        let geom = await crs.call("gfx_work_order_shape_factory", "work_order_duration", {
            aabb: {
                minX: 0.0,
                minY: 0.0,
                maxX: 3.0,
                maxY: 0.2
            },
            triangle_height: 0.18,
            triangle_width: 0.2,
            bar_height: 0.05
        });

        await crs.call("gfx_geometry", "from", {
            element: canvas, data: {
                positions: geom.vertices,
                indices: geom.indices
            }, position: {x: 0, y: 0}, color: "#000000"
        });

        geom = await crs.call("gfx_work_order_shape_factory", "work_order_duration_reverse", {
            aabb: {
                minX: -4.0,
                minY: 0.0,
                maxX: -1.0,
                maxY: 0.2
            },
            triangle_height: 0.18,
            triangle_width: 0.2,
            bar_height: 0.05
        });

        await crs.call("gfx_geometry", "from", {
            element: canvas, data: {
                positions: geom.vertices,
                indices: geom.indices
            }, position: {x: 0, y: 0}, color: "#000000"
        });
    }
}
import "./../../src/managers/mesh-factory-manager.js"

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.currentColor = "#ffffff";
        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);

            crs.call("gfx_mesh_factory", "create", {
                element: this.canvas,
                mesh: {
                    id: "my_mesh",
                    type: "sphere",
                    options: {segments: 16, diameter: 1},
                },
                material: {
                    id: "my_color",
                    color: "#ff0090"
                },
                positions: [{x: 0, y: 1, z: 0}, {x: 1, y: 1, z: 0}, {x: 2, y: 1, z: 0}]
            })

            crs.call("gfx_instances", "add", {
                element: this.canvas,
                id: "my_path_items",
                positions: [
                    {x: 0, y: 0, z:0},
                    {x: 2, y: 0, z:0},
                    {x: 4, y: 0, z:0}
                ],
                material: {
                    id: "my_color2",
                    color: "#ff9000"
                },
                mesh: {
                    id: "my_path_items_mesh",
                    type: "sphere",
                    options: {diameter: 1, segments: 16}
                }
            })

            // crs.call("gfx_instances", "add", {
            //     canvas: this.canvas,
            //     id: "my_path_items",
            //     positions: [
            //         {x: 0, y: 2, z:0},
            //         {x: 2, y: 2, z:0},
            //         {x: 4, y: 2, z:0}
            //     ],
            // })
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async add() {
        crs.call("gfx_instances", "add", {
            element: this.canvas,
            id: "my_path_items",
            positions: [
                {x: 0, y: 2, z:0},
                {x: 2, y: 2, z:0},
                {x: 4, y: 2, z:0}
            ]
        })

    }

    async remove() {
        crs.call("gfx_instances", "remove", {
            element: this.canvas,
            id: "my_path_items",
            index: 3,
            count: 3
        })
    }
}
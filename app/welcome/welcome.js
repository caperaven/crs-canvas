export default class Welcome extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        const canvas = this.element.querySelector("canvas");

        const ready = async () => {
            canvas.removeEventListener("ready", ready);
            await import("./../../src/managers/geometry-factory-manager.js");
            await this.addMeshes(canvas);
        }

        if (canvas.dataset.ready == "true") {
            ready();
        } else {
            canvas.addEventListener("ready", ready);
        }
    }


    async addMeshes(canvas) {
        canvas.__layers[0].onPointerDown = (event, pickResult) => {
            console.log(pickResult.pickedPoint)
        }

        // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), canvas.__layers[0]);
        // light.intensity = 1;

        // const box = BABYLON.MeshBuilder.CreateGridBox("grid", {size: 16, ratio: 1}, canvas.__layers[0]);
        // box.position.y = 2.5;
        // BABYLON.MeshBuilder.CreateBox("box", {size: 1}, canvas.__layers[0]);

        //crs.call("gfx_geometry", "add", { element: canvas, data: "icons/home", position: {x: -1, y: 1}, color: "#ff0090" });
        // crs.call("gfx_geometry", "add", { element: canvas, data: "flowchart/documents", position: {x: 1, y: 1}, color: "#ff9000" });
        // crs.call("gfx_geometry", "add", { element: canvas, data: "floorplan/fire_hose", position: {x: 1, y: -1}, color: "#9000ff" });

        /*****************************************************************************************************/

        await this.range_bars(canvas, {
            pillar: {
                aabb: {
                    minX: -0.1,
                    minY: 0.3,
                    maxX: 0.1,
                    maxY: 0.5
                },
                triangle_height: 0.1,
                triangle_width: 0.1,
                bar_height: 0.4
            },
            rect: {
                aabb: {
                    minX: 0,
                    minY: 0.45,
                    maxX: 0,
                    maxY: 0.75
                },
                bar_height: 0.3
            },
            range: {
                aabb: {
                    minX: 0.0,
                    minY: 0.0,
                    maxX: 0.0,
                    maxY: 0.2
                },
                triangle_height: 0.15,
                triangle_width: 0.2,
                bar_height: 0.05
            }
        });

        /*****************************************************************************************************/

        await this.range_bars(canvas, {
            pillar: {
                aabb: {
                    minX: 1.0,
                    minY: 0.3,
                    maxX: 1.1,
                    maxY: 0.5
                },
                triangle_height: 0.1,
                triangle_width: 0.1,
                bar_height: 0.4
            },
            rect: {
                aabb: {
                    minX: 1.0,
                    minY: 0.45,
                    maxX: 1.0,
                    maxY: 0.75
                },
                bar_height: 0.3
            },
            range: {
                aabb: {
                    minX: 1.0,
                    minY: 0.0,
                    maxX: 1.0,
                    maxY: 0.2
                },
                triangle_height: 0.15,
                triangle_width: 0.2,
                bar_height: 0.05
            }
        });

        /*****************************************************************************************************/

        await this.range_bars(canvas, {
            pillar: {
                aabb: {
                    minX: -2.0,
                    minY: 0.3,
                    maxX: -1.0,
                    maxY: 0.5
                },
                triangle_height: 0.1,
                triangle_width: 0.1,
                bar_height: 0.4,
                top_triangle: true
            },
            rect: {
                aabb: {
                    minX: -1.9,
                    minY: 0.45,
                    maxX: -1.1,
                    maxY: 0.75
                },
                bar_height: 0.3
            },
            range: {
                aabb: {
                    minX: -2.0,
                    minY: 0.0,
                    maxX: -1.0,
                    maxY: 0.2
                },
                triangle_height: 0.15,
                triangle_width: 0.2,
                bar_height: 0.05
            }
        });

        /*****************************************************************************************************/

        await this.range_bars(canvas, {
            pillar: {
                aabb: {
                    minX: -3.0,
                    minY: 0.3,
                    maxX: -3.0,
                    maxY: 0.5
                },
                triangle_height: 0.1,
                triangle_width: 0.1,
                bar_height: 0.4
            },
            rect: {
                aabb: {
                    minX: -3.0,
                    minY: 0.45,
                    maxX: -3.0,
                    maxY: 0.75
                },
                bar_height: 0.3
            },
            range: {
                aabb: {
                    minX: -3.0,
                    minY: 0.0,
                    maxX: -3.0,
                    maxY: 0.2
                },
                triangle_height: 0.15,
                triangle_width: 0.2,
                bar_height: 0.05
            }
        });
    }

    async range_bars(canvas, options) {
        const pillar = await crs.call("gfx_timeline_shape_factory", "pillar", options.pillar);

        await crs.call("gfx_geometry", "from", {
            element: canvas,
            data: {
                positions: pillar.vertices,
                indices: pillar.indices
            },
            id: "wob1",
            position: {x: 0, y: 0},
            material: {
                id: "light_blue",
                color: "#C8E5E1"
            }
        });

        let rect = await crs.call("gfx_timeline_shape_factory", "rect", options.rect);

        await crs.call("gfx_geometry", "from", {
            element: canvas,
            data: {
                positions: rect.vertices,
                indices: rect.indices
            },
            id: "act1",
            position: {x: 0, y: 0, z: -0.001},
            material: {
                condition: "status == 'ap' ? '#ff0090' : '#90ff00'",
                id: "blue"
            },
            layer: 0,
            model: {status: "b"}
        });

        const range = await crs.call("gfx_timeline_shape_factory", "range_indicator", options.range );

        await crs.call("gfx_geometry", "from", {
            element: canvas,
            data: {
                positions: range.vertices,
                indices: range.indices
            },
            id: "wod2",
            position: {x: 0, y: 0},
            material: {
                id: "black",
                color: "#000000"
            }
        });
    }
}
import "./../../src/managers/geometry-factory-manager.js";
import "./../../src/managers/mesh-factory-manager.js";
import "../../components/timeline/managers/timeline-manager.js";

const getDates = () => {
    const dates = [
        {start: new Date(Date.UTC(2022, 0, 1, -2)),end: new Date(Date.UTC(2022, 0, 3, -2))},
        {start: new Date(Date.UTC(2022, 0, 12, -2)),end:  new Date(Date.UTC(2022, 0, 18, -2))},
        {start: new Date(Date.UTC(2022, 0, 21, -2)),end:  new Date(Date.UTC(2022, 0, 31, -2))},
        {start: new Date(Date.UTC(2022, 11, 21, -2)),end:  new Date(Date.UTC(2022, 11, 31, 21))},
    ];

    return dates;
}

export default class TimeLine extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        this.canvas = this.element.querySelector("canvas");
        this.scale = "month";
        this.dates = getDates();
        console.log(this.dates);

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);
            this.addMeshes();

            //init timeline manager
            this._initTimelineManager();
            this._renderDates();
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        this.bgPlane.dispose();
        this.bgPlane = null;
        this.canvas = null;
    }

    async addMeshes() {
        await this.createPlane()

        const meshes = [];
        meshes.push(await crs.call("gfx_mesh_factory", "create", {
            element: this.canvas,
            mesh: {
                id: "my_mesh",
                type: "plane",
                options: {
                    width: 0.1,
                    height: 0.1
                }
            },
            positions: [{x: 0, y: 0, z:0}],
            material: {
                id: "my_color",
                color: "#ff0090"
            }
        }))

        const gizmoManager = new BABYLON.GizmoManager(this.canvas.__layers[0])
        gizmoManager.boundingBoxGizmoEnabled = true
        gizmoManager.attachableMeshes = meshes;
    }

    async createPlane() {
        this.bgPlane = BABYLON.MeshBuilder.CreatePlane("plane", {
            size: 200,
            position: {z: -0.1}
        }, this.canvas.__layers[0]);
        this.bgPlane.material = new BABYLON.GridMaterial("grid", this.canvas.__layers[0]);
        this.bgPlane.material.gridRatio = 0.1;
        this.bgPlane.material.mainColor = new BABYLON.Color3(1, 1, 1);
        this.bgPlane.material.lineColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        this.bgPlane.enablePointerMoveEvents = true;
        this.bgPlane.position.z = 0.01;
    }

    async setScale(viewType) {
        this.scale = viewType;
        //redraw
    }

    async _initTimelineManager() {
        await crs.call("gfx_timeline_manager", "initialize", {element: this.canvas, min: this.dates[0].start, max: this.dates[3].end});
    }

    async _renderDates() {
        for (let i = 0; i < this.dates.length; i++) {
            const result = await crs.call("gfx_timeline_manager", "get", {element: this.canvas, start: this.dates[i].start, end: this.dates[i].end, scale: this.scale});

            //NOTE: the calcs I'm doing on width & position. Can move that logic into the manager if needed i.e. get() can return width and an already transformed x1
            await crs.call("gfx_mesh_factory", "create", {
                element: this.canvas,
                mesh: {
                    id: `mesh_${i}`,
                    type: "plane",
                    options: {
                        width: result.width,
                        height: 0.5
                    }
                },
                positions: [{x: result.x, y: -i + 0.5, z:0}],
                material: {
                    id: "bar_colour",
                    color: "#14645b"
                }
            })
        }
    }
}

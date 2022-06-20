import "./../../src/meshes/grid-box.js";

export default class FaceSelect extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        this.mode = "curve";
        this.canvas = this.element.querySelector("canvas");

        const ready = () => {
            this.canvas.removeEventListener("ready", ready);
            this.addMeshes();
            this.addEvents();
        }

        if (this.canvas.dataset.ready == "true") {
            ready();
        } else {
            this.canvas.addEventListener("ready", ready);
        }
    }

    async disconnectedCallback() {
        this.canvas.__layers[0].onPointerDown = null;
        this.canvas.__layers[0].pointerMove = null;
        this.canvas.__layers[0].pointerUp = null;
        this.bgPlane.dispose();
        this.bgPlane = null;
        this.canvas = null;
    }

    async addMeshes() {
        await this.createPlane()

        const meshes = [];
        meshes.push(await crs.call("gfx_geometry", "add", {
            element: this.canvas,
            data: "icons/home",
            position: {x: -1, y: 1},
            color: "#ff0090"
        }));
        meshes.push(await crs.call("gfx_geometry", "add", {
            element: this.canvas,
            data: "flowchart/documents",
            position: {x: 1, y: 2},
            color: "#ff9000"
        }));
        meshes.push(await crs.call("gfx_geometry", "add", {
            element: this.canvas,
            data: "floorplan/fire_hose",
            position: {x: 0, y: 0},
            color: "#9000ff"
        }));


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

    addEvents() {
        this.canvas.__layers[0].onPointerDown = this.pointerDown.bind(this);
        this.canvas.__layers[0].onPointerMove = this.pointerMove.bind(this);
        this.canvas.__layers[0].onPointerUp = this.pointerUp.bind(this);
    }

    async pointerDown(event, pickResult) {
        if (event.button === 0 && pickResult.pickedMesh === this.bgPlane) {
            this.pickedPoint = pickResult.pickedPoint;

            await this[`_down_${this.mode}`]();

        }
    }

    async _down_rectangle() {
        this.selectionPlane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 0}, this.canvas.__layers[0]);
        this.selectionPlane.scaling.x = 0;
        this.selectionPlane.scaling.y = 0;
        this.selectionPlane.setPivotPoint(new BABYLON.Vector3(-0.5, -0.5, 0));

        this.selectionPlane.position = this.pickedPoint.add(new BABYLON.Vector3(0.5, 0.5, 0));
        this.selectionPlane.material = await crs.call("gfx_materials", "get", {
            element: this.canvas,
            value: "#56b6ff"
        });
        this.selectionPlane.material.alpha = 0.5;
        this.selectionPlane.enableEdgesRendering();
        this.selectionPlane.edgesWidth = 2.0;
        this.selectionPlane.edgesColor = new BABYLON.Color4(0.2, 0.5, 1, 1);
    }

    async _move_rectangle(pickResult) {
        if (this.selectionPlane) {
            const width = pickResult.pickedPoint.x - this.pickedPoint.x;
            const height = pickResult.pickedPoint.y - this.pickedPoint.y;

            this.selectionPlane.scaling.x = width;
            this.selectionPlane.scaling.y = height;
        }
    }

    async _up_rectangle() {
        if (this.selectionPlane) {
            this.selectionPlane.dispose();
            this.selectionPlane = null;
        }
    }

    async _down_curve() {

    }

    async _move_curve(pickResult) {
        this.addLines(pickResult);
    }

    async _up_curve() {
        if(this.meshes != null) {
            for (const mesh of this.meshes) {
                mesh.dispose();
            }
            this.meshes = null;

        }
        if(this.curve != null) {
            this.curve.dispose();
        }
    }

    async pointerMove(event, pickResult) {
        if(this.pickedPoint != null) {
            await this[`_move_${this.mode}`](pickResult);
        }
    }

    async pointerUp() {
        this.pickedPoint = null;
        await this[`_up_${this.mode}`]();
    }

    async setMode(mode) {
        this.mode = mode;
    }

    async addLines(pickResult) {

        if(this.curve != null) {
            this.curve.dispose();
        }

        const start = this.pickedPoint;
        const end = pickResult.pickedPoint;




        const pointA = new BABYLON.Vector3(start.x, start.y, 0);
        const pointB = new BABYLON.Vector3(end.x, end.y, 0);

        const cPointA = new BABYLON.Vector3(start.x, end.y, 0);
        const cPointB = new BABYLON.Vector3(end.x, start.y, 0);

        const bezier = BABYLON.Curve3.CreateCubicBezier(pointA, cPointA, cPointB, pointB, 32);
        // Path3D

        const path3d = new BABYLON.Path3D(bezier.getPoints());
        const tangents = path3d.getTangents();
        const curve = path3d.getCurve();

        // console.log("tag", tangents)
        // console.log("curve", curve);

        // visualisation
        this.curve = BABYLON.Mesh.CreateLines('li', curve, this.canvas.__layers[0]);

        this.curve.color = BABYLON.Color3.Red();

        console.log(curve.length);
        if(this.meshes == null) {
            console.log("is null");
            this.meshes = [];
            for (let i = 0; i < curve.length; i++) {
                const curvePoint = curve[i];
                const tangentPoint = tangents[i];
                const plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 0.25}, this.canvas.__layers[0]);
                plane.position = curvePoint;


                this.meshes.push(plane);
            }
        }
        else {
            for (let i = 0; i < curve.length; i++) {
                const curvePoint = curve[i];

                this.meshes[i].position.x = curvePoint.x;
                this.meshes[i].position.y = curvePoint.y;

            }
        }
    }
}

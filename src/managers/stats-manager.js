export class StatsManagerActions {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async addInspector(step, context, process, item) {
        const canvas = await crs.dom.get_element(step, context, process, item);
        const layer = (await crs.process.getValue(step.args.layer, context, process, item)) || 0;
        const scene = canvas.__layers[layer];

        const overlay = document.createElement("div");
        overlay.style.position = "fixed"
        overlay.style.top = "0";
        overlay.style.right = "0";
        overlay.style.bottom = "0";


        document.body.appendChild(overlay);

        scene.debugLayer.show({
            globalRoot: overlay
        });


    }
}


crs.intent.gfx_stats = StatsManagerActions;
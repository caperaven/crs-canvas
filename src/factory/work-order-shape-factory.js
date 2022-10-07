import init, {fill} from "../../bin/geometry.js";

export class WorkOrderShapeFactory {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async work_order_duration(step, context, process, item) {
        const aabb = await crs.process.getValue(step.args.aabb);
        if (aabb == null) return;

        const bar_height = await crs.process.getValue(step.args.bar_height) ?? 0.1;
        const triangle_height = await crs.process.getValue(step.args.triangle_height) ?? 0.1;
        const triangle_width = await crs.process.getValue(step.args.triangle_width) ?? 0.2;

        const path = [
            [['m'],[aabb.minX],[aabb.minY],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.maxX - (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.maxX - triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.minX + triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.minX + (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.minX],[aabb.minY + bar_height],[0.0]],
            [['z']]
        ]

        path.every(i => i.join(","));
        const path_str = path.join(",");

        await init();
        const geometry_data = await fill(path_str);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, geometry_data, context, process, item);
        }

        return geometry_data;
    }

    static async work_order_duration_reverse(step, context, process, item) {
        const aabb = await crs.process.getValue(step.args.aabb);
        if (aabb == null) return;

        const bar_height = await crs.process.getValue(step.args.bar_height) ?? 0.1;
        const triangle_height = await crs.process.getValue(step.args.triangle_height) ?? 0.1;
        const triangle_width = await crs.process.getValue(step.args.triangle_width) ?? 0.2;

        const path = [
            [['m'],[aabb.minX],[aabb.minY],[0.0]],
            [['l'],[aabb.minX],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.minX + (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.minX + triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.maxX - triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.maxX - (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY],[0.0]],
            [['z']]
        ]

        path.every(i => i.join(","));
        const path_str = path.join(",");

        await init();
        const geometry_data = await fill(path_str);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, geometry_data, context, process, item);
        }

        return geometry_data;
    }
}

crs.intent.gfx_work_order_shape_factory = WorkOrderShapeFactory;
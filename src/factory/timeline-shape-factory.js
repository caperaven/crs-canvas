import init, {fill} from "../../bin/geometry.js";

await init();

export class TimelineShapeFactory {
    static async perform(step, context, process, item) {
        return this[step.action]?.(step, context, process, item);
    }

    static async range_indicator(step, context, process, item) {
        const aabb = await crs.process.getValue(step.args.aabb);
        if (aabb == null) return;

        const bar_height = await crs.process.getValue(step.args.bar_height) ?? 0.1;
        const triangle_height = await crs.process.getValue(step.args.triangle_height) ?? 0.1;
        const triangle_width = await crs.process.getValue(step.args.triangle_width) ?? 0.2;

        let path = [
            [['m'],[aabb.minX],[aabb.minY],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY],[0.0]],
            [['l'],[aabb.maxX],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.maxX - (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.maxX - triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.minX + triangle_width],[aabb.minY + bar_height],[0.0]],
            [['l'],[aabb.minX + (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
            [['l'],[aabb.minX],[aabb.minY + bar_height],[0.0]],
            [['z']]
        ];

        if (Math.abs(aabb.maxX - aabb.minX) < triangle_width) {
            aabb.maxX = aabb.minX + triangle_width / 2;
            aabb.minX = aabb.minX - triangle_width / 2;
            path = [
                [['m'],[aabb.minX],[aabb.minY],[0.0]],
                [['l'],[aabb.maxX],[aabb.minY],[0.0]],
                [['l'],[aabb.maxX],[aabb.minY + bar_height],[0.0]],
                [['l'],[aabb.minX + triangle_width],[aabb.minY + bar_height],[0.0]],
                [['l'],[aabb.minX + (triangle_width / 2.0)],[aabb.minY + bar_height + triangle_height],[0.0]],
                [['l'],[aabb.minX],[aabb.minY + bar_height],[0.0]],
                [['z']]
            ];
        }

        path.every(i => i.join(","));
        const path_str = path.join(",");

        const geometry_data = await fill(path_str);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, geometry_data, context, process, item);
        }

        return geometry_data;
    }


    static async pillar(step, context, process, item) {
        const aabb = await crs.process.getValue(step.args.aabb);
        if (aabb == null) return;

        const bar_height = await crs.process.getValue(step.args.bar_height) ?? 0.1;
        const triangle_height = await crs.process.getValue(step.args.triangle_height) ?? 0.1;
        const triangle_width = await crs.process.getValue(step.args.triangle_width) ?? 0.2;
        const top_triangle = await crs.process.getValue(step.args.top_triangle) ?? false;

        if (aabb.maxX - aabb.minX < triangle_width * 2) {
            aabb.maxX = aabb.minX + (triangle_width * 2) / 2;
            aabb.minX = aabb.minX - (triangle_width * 2) / 2;
        }

        const path = [
            [['m'],[aabb.minX], [aabb.minY], [0.0]],
            [['l'],[aabb.minX + triangle_width], [aabb.minY + triangle_height], [0.0]],
            [['l'],[aabb.maxX - triangle_width] , [aabb.minY + triangle_height], [0.0]],
            [['l'],[aabb.maxX], [aabb.minY], [0.0]],
            [['l'],[aabb.maxX], [aabb.minY + triangle_height + bar_height], [0.0]],
            [['l'],[aabb.minX], [aabb.minY + triangle_height + bar_height], [0.0]],
            [['z']]
        ]

        if (top_triangle === true) {
            path[4] = [['l'],[aabb.maxX], [aabb.minY + bar_height + (triangle_height * 2)], [0.0]];
            path[5] = [['l'],[aabb.maxX - triangle_width], [aabb.minY + bar_height + triangle_height], [0.0]];
            path[6] = [['l'],[aabb.minX + triangle_width], [aabb.minY + bar_height + triangle_height], [0.0]];
            path[7] = [['l'],[aabb.minX], [aabb.minY + triangle_height + triangle_height + bar_height], [0.0]];
            path.push([['z']]);
        }

        path.every(i => i.join(","));
        const path_str = path.join(",");

        const geometry_data = await fill(path_str);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, geometry_data, context, process, item);
        }

        return geometry_data;
    }

    static async rect(step, context, process, item) {
        const aabb = await crs.process.getValue(step.args.aabb);
        if (aabb == null) return;

        const bar_height = await crs.process.getValue(step.args.bar_height) ?? 0.1;

        if (aabb.maxX - aabb.minX < 0.2) {
            aabb.minX = aabb.minX - 0.05;
            aabb.maxX = aabb.minX + 0.1;
        }

        const path = [
            [['m'],[aabb.minX], [aabb.minY], [0.0]],
            [['l'],[aabb.maxX] , [aabb.minY], [0.0]],
            [['l'],[aabb.maxX], [aabb.minY + bar_height], [0.0]],
            [['l'],[aabb.minX], [aabb.minY + bar_height], [0.0]],
            [['z']]
        ]

        path.every(i => i.join(","));
        const path_str = path.join(",");

        const geometry_data = await fill(path_str);

        if (step.args.target != null) {
            await crs.process.setValue(step.args.target, geometry_data, context, process, item);
        }

        return geometry_data;
    }
}


crs.intent.gfx_timeline_shape_factory = TimelineShapeFactory;
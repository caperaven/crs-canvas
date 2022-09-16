use lyon::tessellation::geometry_builder::{simple_builder, VertexBuffers};
use lyon::tessellation::{StrokeTessellator, StrokeOptions};

use lyon::path::{Path};
use lyon::path::math::{Point};

pub type PolyBuffer = VertexBuffers<Point, u16>;

pub fn extrude_path(path: &Path) -> PolyBuffer {
    let mut buffer: PolyBuffer = VertexBuffers::new();
    {
        let mut vertex_builder = simple_builder(&mut buffer);
        let mut tessellator = StrokeTessellator::new();

        let options = StrokeOptions::default();

        tessellator.tessellate_path (
            path,
            &options,
            &mut vertex_builder
        ).ok();
    }
    return buffer;
}
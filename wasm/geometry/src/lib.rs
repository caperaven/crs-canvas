mod path_utils;
mod fill_utils;
mod utils;

use lyon::path::math::{Point};
use lyon::tessellation::geometry_builder::{VertexBuffers};

type PolyBuffer = VertexBuffers<Point, u16>;


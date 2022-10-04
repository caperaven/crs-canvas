mod path_utils;
mod fill_utils;
mod utils;

use wasm_bindgen::prelude::wasm_bindgen;
use lyon::path::math::{Point};
use lyon::tessellation::geometry_builder::{VertexBuffers};

type PolyBuffer = VertexBuffers<Point, u16>;

#[wasm_bindgen]
pub fn fill(data: &str) -> js_sys::Object {
    let path = path_utils::create_path(data);
    let buffer = fill_utils::create_fill(&path);
    let aabb = path_utils::get_aabb(&path);
    return utils::populate_from_buffer(&buffer, &aabb);
}


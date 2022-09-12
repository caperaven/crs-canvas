mod extrude;
mod utils;

use wasm_bindgen::prelude::*;
use js_sys::{Object};
use lyon::path::Path;
use lyon::math::{point};
use crate::utils::get_aabb;

// https://docs.rs/lyon/latest/lyon/
// https://docs.rs/lyon/0.9.1/lyon/tessellation/basic_shapes/index.html

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn line_geometry(x1: f32, y1: f32, x2: f32, y2: f32) -> Object {
    let mut builder = Path::builder();
    builder.begin(point(x1, y1));
    builder.line_to(point(x2, y2));
    builder.close();
    let path = builder.build();
    let aabb = get_aabb(&path);
    let poly_builder = extrude::extrude_path(&path);

    utils::populate_from_buffer(&poly_builder, &aabb)
}
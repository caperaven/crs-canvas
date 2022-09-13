use wasm_bindgen::prelude::*;
use lyon::path::{Path};
use js_sys::{Object, Array};
use lyon::math::{Box2D};
use crate::extrude;

pub fn get_aabb(path: &Path) -> Box2D {
    lyon::algorithms::aabb::bounding_box(path.iter())
}

pub fn populate_from_buffer(buffers: &extrude::PolyBuffer, aabb: &Box2D) -> Object {
    let result = Object::new();
    let vertices = Array::new();
    let indices = Array::new();

    for point in buffers.vertices.iter() {
        vertices.push(&JsValue::from(point.x.floor()));
        vertices.push(&JsValue::from(point.y.floor()));
        vertices.push(&0.into());
    }

    for &ind in buffers.indices.iter() {
        let value = &JsValue::from(ind);
        indices.push(value);
    }

    let aa_result = Object::new();
    js_sys::Reflect::set(&aa_result, &"minX".into(), &aabb.min.x.into()).ok();
    js_sys::Reflect::set(&aa_result, &"minY".into(), &aabb.min.y.into()).ok();
    js_sys::Reflect::set(&aa_result, &"maxX".into(), &aabb.max.x.into()).ok();
    js_sys::Reflect::set(&aa_result, &"maxY".into(), &aabb.max.y.into()).ok();

    js_sys::Reflect::set(&result, &"vertices".into(), &vertices.into()).ok();
    js_sys::Reflect::set(&result, &"indices".into(), &indices.into()).ok();
    js_sys::Reflect::set(&result, &"aabb".into(), &aa_result.into()).ok();

    return result;
}
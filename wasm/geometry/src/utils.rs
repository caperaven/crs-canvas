use lyon::math::Box2D;
use js_sys::{Array, Object};
use wasm_bindgen::JsValue;
use crate::PolyBuffer;

/// Returns a js_sys object which can be sent via wasm
pub fn populate_from_buffer(buffers: &PolyBuffer, aabb: &Box2D) -> Object {
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

    //TODO :: AA expose for javascript via wasm
    //let aa_result = Object::new();
    // js_sys::Reflect::set(&aa_result, &"originX".into(), &aabb.origin.x.into()).ok();
    // js_sys::Reflect::set(&aa_result, &"originY".into(), &aabb.origin.y.into()).ok();
    // js_sys::Reflect::set(&aa_result, &"width".into(), &aabb.size.width.into()).ok();
    // js_sys::Reflect::set(&aa_result, &"height".into(), &aabb.size.height.into()).ok();
    //
    // js_sys::Reflect::set(&result, &"vertices".into(), &vertices.into()).ok();
    // js_sys::Reflect::set(&result, &"indices".into(), &indices.into()).ok();
    // js_sys::Reflect::set(&result, &"aabb".into(), &aa_result.into()).ok();

    return result;
}
use lyon::path::Path;
use lyon::path::math::point;
use lyon::algorithms::path::path::Builder;
use lyon::math::Box2D;

macro_rules! to_point {
    ($list:expr, $index:expr) => ({
        let x = $list[$index + 1].parse().unwrap();
        let y = $list[$index + 2].parse().unwrap();
        point(x, y)
    });
}

pub fn create_builder(data: &str) -> Builder {
    let value = String::from(data.replace(" ", ""));
    let parts: Vec<&str> = value.split(",").collect();
    let length = parts.len();
    let mut builder = Path::builder();
    let mut close = false;
    let mut i = 0;

    while i < length {
        let char = parts[i];

        match char {
            "m" => {
                builder.begin(to_point!(parts, i));
                i += 3;
            }
            "l" => {
                builder.line_to(to_point!(parts, i));
                i += 3;
            },
            "q" => {
                builder.quadratic_bezier_to(to_point!(parts, i), to_point!(parts, i + 2));
                i += 5;
            },
            "c" => {
                builder.cubic_bezier_to(to_point!(parts, i), to_point!(parts, i + 2), to_point!(parts, i + 4));
                i += 7;
            },
            "z" => {
                close = true;
                break;
            }
            _ => {
                i = i + 1;
            }
        }
    }

    builder.end(close);
    return builder;
}

pub fn create_path(data: &str) -> Path {
    let builder = create_builder(data);
    return builder.build();
}

pub fn get_aabb(path: &Path) -> Box2D {
    let box2d = lyon::algorithms::aabb::bounding_box(path);
    return box2d;
}

#[test]
pub fn create_path_test() {
    let res = create_path("m, -100,-100,0.0, l,100,-100,0.0, l,100,100,0.0, l,-100,100,0.0, z");
    let formatted = format!("{:?}", res);
    let expected = "\" M -100.0 -100.0 L 100.0 -100.0 L 100.0 100.0 L -100.0 100.0 Z\"".to_string();
    assert_eq!(formatted, expected);
}
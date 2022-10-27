/**
 * Convert the font json file for msdf to be more appropriate for rendering
 */

import {font} from "./font-files/icons_font.js";

function convertFont() {
    const result = {
        info: {
            size: font.atlas.size,
            distanceRange: font.atlas.distanceRange
        },
        common: {
            lineHeight: font.atlas.size * font.metrics.lineHeight,
            scaleW: font.atlas.width,
            scaleH: font.atlas.height
        },
        chars: {}
    };

    /**
     * gl units 1 = lineHeight
     * all the other units are factors of the line height
     * normalize the values to be in standard webgl units
     */

    for (let glyph of font.glyphs) {
        const char = glyph.unicode;
        const uv = calculateUV(glyph, result.common.scaleW, result.common.scaleH);

        const width = (glyph.planeBounds?.right - glyph.planeBounds?.left) || 0.25;
        const height = (glyph.planeBounds?.top - glyph.planeBounds?.bottom) || 1;

        result.chars[char] = {
            u1: uv[0],
            v1: uv[1],
            u2: uv[0] + uv[2],
            v2: uv[1] + uv[3],
            width: width,
            height: height,
            xoffset: glyph.planeBounds?.left || 0,
            yoffset: glyph.planeBounds?.top || 0,
            xadvance: width + glyph.planeBounds?.left || 0
        }
    }

    return result;
}

function calculateUV(glyph, atlasWidth, atlasHeight) {
    if (!glyph.atlasBounds) return [0, 0, 0, 0]
    let x = glyph.atlasBounds.left / atlasWidth
    let y = glyph.atlasBounds.bottom / atlasHeight
    let width = (glyph.atlasBounds.right - glyph.atlasBounds.left) / atlasWidth
    let height = (glyph.atlasBounds.top - glyph.atlasBounds.bottom) / atlasHeight
    return [x, y, width, height]
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

const newFont = convertFont();
console.log(newFont);
const js = `export const font = ${JSON.stringify(newFont, null, 4)}`;
await Deno.writeTextFile("./../src/managers/utils/icons.js", js);


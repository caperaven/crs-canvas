/**
 * Convert the font json file for msdf to be more appropriate for rendering
 */

import {font} from "./../src/msdf/SourceSansPro-Regular-msdf.js";

function convertFont() {
    const result = {
        info: {
            face: font.info.face,
            size: font.info.size
        },
        common: {
            lineHeight: font.common.lineHeight,
            scaleW: font.common.scaleW,
            scaleH: font.common.scaleH
        },
        chars: {}
    };

    /**
     * gl units 1 = lineHeight
     * all the other units are factors of the line height
     * normalize the values to be in standard webgl units
     */

    for (let char of font.chars) {
        result.chars[char.char] = {
            u: normalize(char.x, 0, font.common.scaleW),
            v: normalize(char.y, 0, font.common.scaleH),
            width: normalize(char.width, 0, font.common.lineHeight),
            height: normalize(char.height, 0, font.common.lineHeight),
            xoffset: normalize(char.xoffset, 0, font.common.lineHeight),
            yoffset: normalize(char.yoffset, 0, font.common.lineHeight),
            xadvance: normalize(char.xadvance, 0, font.common.lineHeight)
        }
    }

    return result;
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

const newFont = convertFont();
const js = `export const font = ${JSON.stringify(newFont, null, 4)}`;
await Deno.writeTextFile("./../src/msdf/font.js", js);

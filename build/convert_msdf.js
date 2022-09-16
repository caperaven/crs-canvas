/**
 * Convert the font json file for msdf to be more appropriate for rendering
 */

import {font} from "./font-files/SourceSansPro-Regular-msdf.js";

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
        const u = normalize(char.x, 0, font.common.scaleW);
        const v = 1 - normalize(char.y + char.height, 0, font.common.scaleH);
        const uw = normalize(char.width, 0, font.common.scaleW);
        const vh = normalize(char.height, 0, font.common.scaleW);

        result.chars[char.char] = {
            u1: u,
            v1: v,
            u2: u + uw,
            v2: v + vh,
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
await Deno.writeTextFile("./../src/managers/utils/font.js", js);


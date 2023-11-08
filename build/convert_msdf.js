/**
 * Convert the font json file for msdf to be more appropriate for rendering
 */


async function convertFont(name) {

    const cmdArgs = [
        "font-files/msdf-atlas-gen",
        "-font", `font-files/${name}.ttf`,
        "-type", "sdf",
        "-imageout", `./font-files/temp_font.png`,
        "-format", "png",
        "-json", "./font-files/temp_font.json",
        "-size", "64",
        "-pxrange", "4",
    ];

    const p = Deno.run({
        cmd: cmdArgs,
        stderr: 'piped', stdout: 'piped'
    });

    const [status, stdout] = await Promise.all([
        p.status(),
        p.output(),
    ]);
    p.close();

    if(status.code != 0) throw new Error(new TextDecoder().decode(stdout));



    const file = await Deno.readTextFile(`./font-files/temp_font.json`);
    const font = JSON.parse(file);

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
        const char = String.fromCharCode(glyph.unicode);
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

    const js = `export const font = ${JSON.stringify(result, null, 4)}`;
    await Deno.writeTextFile(`./../src/managers/font-atlas/${name}.js`, js);

    // Copy png to assets folder
    await Deno.copyFile(`./font-files/temp_font.png`, `./../assets/textures/${name}.png`);

    await Deno.remove(`./font-files/temp_font.png`);
    await Deno.remove(`./font-files/temp_font.json`);
}

function calculateUV(glyph, atlasWidth, atlasHeight) {
    if (!glyph.atlasBounds) return [0, 0, 0, 0]
    let x = glyph.atlasBounds.left / atlasWidth
    let y = glyph.atlasBounds.bottom / atlasHeight
    let width = (glyph.atlasBounds.right - glyph.atlasBounds.left) / atlasWidth
    let height = (glyph.atlasBounds.top - glyph.atlasBounds.bottom) / atlasHeight
    return [x, y, width, height]
}


await convertFont("font");
await convertFont("font_bold");


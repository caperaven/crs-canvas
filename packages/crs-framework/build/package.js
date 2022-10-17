/**
 * Build script using deno
 * https://droces.github.io/Deno-Cheat-Sheet/
 */

import { copy, emptyDir, ensureDir } from "https://deno.land/std@0.149.0/fs/mod.ts";
import * as esbuild from 'https://deno.land/x/esbuild@v0.14.50/mod.js'
import init, {minify} from "https://wilsonl.in/minify-html/deno/0.9.2/index.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
await init();

/**
 * This packages a js file with its dependencies as one file.
 * @param file
 * @param output
 * @param minified
 * @returns {Promise<void>}
 */
export async function bundleJs(file, output, minified) {
    const result = await esbuild.build({
        entryPoints: [file],
        bundle: true,
        outfile: output,
        format: "esm",
        minify: minified
    })

    console.log(result);
}

/**
 * Copy files as is from one directory to another
 * @param source
 * @param target
 * @returns {Promise<*|undefined>}
 */
export async function copyDirectory(source, target) {
    await ensureDir(target);

    for await (const dirEntry of Deno.readDir(source)) {
        if (dirEntry.isDirectory == true) {
            await ensureDir(`${target}/${dirEntry.name}`);
            await copyDirectory(`${source}/${dirEntry.name}`, `${target}/${dirEntry.name}`);
            continue;
        }

        await Deno.copyFile(`${source}/${dirEntry.name}`, `${target}/${dirEntry.name}`);

        console.log(`${source}/${dirEntry.name}`);
    }
}

/**
 * Copy files and process them for packaging and minification
 * @param source
 * @param target
 * @param minified
 * @returns {Promise<void>}
 */
export async function packageFolder(source, target, minified) {
    await ensureDir(target);

    for await (const dirEntry of Deno.readDir(source)) {
        if (dirEntry.isDirectory == true) {
            await ensureDir(`${target}/${dirEntry.name}`);
            await packageFolder(`${source}/${dirEntry.name}`, `${target}/${dirEntry.name}`, minified);
            continue;
        }

        const sourceFile = `${source}/${dirEntry.name}`;
        const targetFile = `${target}/${dirEntry.name}`;

        if (dirEntry.name.indexOf(".js") != -1) {
            await packageFile(sourceFile, targetFile, "js", "esm", minified);
        }

        else if (dirEntry.name.indexOf(".html") != -1) {
            await packageHTML(sourceFile, targetFile, minified);
        }

        else if (dirEntry.name.indexOf(".css") != -1) {
            await bundleCss(sourceFile, targetFile, minified);
        }

        else {
            await Deno.copyFile(`${source}/${dirEntry.name}`, `${target}/${dirEntry.name}`);
        }
    }
}

/**
 * Package js file
 * @param sourceFile
 * @param targetFile
 * @param loader
 * @param format
 * @param minified
 * @returns {Promise<void>}
 */
export async function packageFile(sourceFile, targetFile, loader, format, minified) {
    const src = await Deno.readTextFile(sourceFile);
    const result = await esbuild.transform(src, { loader: loader, minify: minified, format: format });
    await Deno.writeTextFile(targetFile, result.code);
}

/**
 * Package html file
 * @param sourceFile
 * @param targetFile
 * @param minified
 * @returns {Promise<void>}
 */
export async function packageHTML(sourceFile, targetFile, minified) {
    let src = await Deno.readTextFile(sourceFile);

    if (minified == true) {
        src = decoder.decode(minify(encoder.encode(src), { minify_css: true, minify_js: true, do_not_minify_doctype: true, keep_closing_tags: true }));
    }

    await Deno.writeTextFile(targetFile, src);
}

/**
 * Package css file
 * @param file
 * @param output
 * @param minified
 * @returns {Promise<void>}
 */
export async function bundleCss(file, output, minified) {
    const result = await esbuild.build({
        entryPoints: [file],
        bundle: true,
        loader: {".css": "css"},
        outfile: output,
        minify: minified
    })

    console.log(result);
}

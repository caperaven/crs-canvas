import {bundleJs, copyDirectory, packageFolder} from "./../packages/crs-framework/build/package.js";
import {ensureDir} from "https://deno.land/std@0.149.0/fs/ensure_dir.ts";
import {emptyDir} from "https://deno.land/std@0.149.0/fs/empty_dir.ts";
import * as path from "https://deno.land/std/path/mod.ts";

async function createFolderStructure() {
    await ensureDir("./dist");
    await emptyDir("./dist");

    await ensureDir("./dist/assets");
    await ensureDir("./dist/build");
    await ensureDir("./dist/bin");
    await ensureDir("./dist/components");
    await ensureDir("./dist/resources");
    await ensureDir("./dist/src");
    await ensureDir("./dist/tests");
    await ensureDir("./dist/tests/mockups");
}

await createFolderStructure();
await copyDirectory("./assets", "./dist/assets");
await copyDirectory("./build", "./dist/build");
await copyDirectory("./bin", "./dist/bin");
await copyDirectory("./tests/mockups", "./dist/tests/mockups");
await copyDirectory("./packages/babylonjs", "./dist/packages/babylonjs");
await copyDirectory("./styles", "./dist/styles");
await copyDirectory("./resources", "./dist/resources");
await copyDirectory("./components", "./dist/components");
await copyDirectory("./src", "./dist/src");

// await packageFolder("./components", "./dist/components", true);
// await packageFolder("./src", "./dist/src", true);

Deno.copyFile("./build/font-files", "./dist/build/font-files");
Deno.copyFile("./build/convert_msdf", "./dist/build/convert_msdf");

Deno.exit(0);
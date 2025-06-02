// @ts-check
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/** 
 * @overload
 * @param {import("./utils/types").Config} config
 * @returns {import("./utils/types").Config}
*/
/** 
 * @overload
 * @param {import("./utils/types").UserConfigFnObject} config
 * @returns {import("./utils/types").UserConfigFnObject}
*/
/** 
 * @overload
 * @param {import("./utils/types").UserConfigFnPromise} config
 * @returns {import("./utils/types").UserConfigFnPromise}
*/
/**
 * @param {import("./utils/types").UserConfigExport} config 
 * @returns {import("./utils/types").UserConfigExport}
 */
export function defineConfig(config) {
    return config
}
/** @type {string} */
export const version = require("./package.json").version
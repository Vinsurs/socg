// @ts-check
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/** 
 * @template {import("./utils/types").UserConfig} T
 * @param {T} config
 * @returns {T}
*/
export function defineConfig(config) {
    return config
}
/** @type {string} */
export const version = require("./package.json").version
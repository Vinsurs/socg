// @ts-check
/** 
 * @template {import("./utils/types").UserConfig} T
 * @param {T} config
 * @returns {T}
*/
function defineConfig(config) {
    return config
}
exports.defineConfig = defineConfig
/** @type {string} */
exports.version = require("./package.json").version
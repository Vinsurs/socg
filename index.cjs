// @ts-check
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
function defineConfig(config) {
    return config
}
exports.defineConfig = defineConfig
/** @type {string} */
exports.version = require("./package.json").version
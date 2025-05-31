// @ts-check
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/**
 * @param {import("./utils/types").Config} config 
 * @returns {import("./utils/types").Config}
 */
export function defineConfig(config) {
    return config
}
/** @type {string} */
export const version = require("./package.json").version
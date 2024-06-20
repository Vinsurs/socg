// @ts-check
import { resolve } from "node:path"

/**
 * @param {string} base 
 * @param  {...string} paths 
 */
export function pathResolve(base = process.cwd(), ...paths) {
    return resolve(base, ...paths)
}
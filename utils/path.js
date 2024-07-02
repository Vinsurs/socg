// @ts-check
import { resolve, relative } from "node:path"
import slash from "slash"

const multiLevel = /^(\.\.\/){2,}/;
/**
 * @param {string} base 
 * @param  {...string} paths 
 */
export function pathResolve(base = process.cwd(), ...paths) {
    return resolve(base, ...paths)
}

/**
 * @param {string} from 
 * @param {string} to 
 * @returns {string}
 */
export function pathRelative(from, to) {
    const ret = slash(relative(from, to))
    if (ret.match(multiLevel)) {
        return ret.slice(3)
    }
    return ret.slice(1)
}
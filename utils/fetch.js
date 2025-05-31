// @ts-check
import fetch from "node-fetch"
import fse from "fs-extra"
import stripBom from "strip-bom"
import { load } from "js-yaml"
import { isHTTPUrl } from "./helper.js"
import { pathResolve } from "./path.js"

/**
 * @param {string} swaggerJsonUrl 
 * @param {string} outputPath 
 */
export function downLoadSwaggerSchema(swaggerJsonUrl, outputPath) {
    return new Promise((resolve, reject) => {
        const ws = fse.createWriteStream(outputPath)
        fetch(swaggerJsonUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/octet-stream",
            },
        })
        .then(res => {
            if (res.ok && res.body) {
                res.body.pipe(ws)
                res.body.on("end", () => {
                    ws.end()
                    resolve(null)
                })
            } else {
                reject(new Error(res.statusText))
            }
        }, reject)        
    })
}

/**
 * @param {string} swaggerJsonUrl
 * @returns {Promise<string>}
 */
export function fetchSwaggerSchema(swaggerJsonUrl) {
    return new Promise((resolve, reject) => {
        fetch(swaggerJsonUrl, {
            method: "GET",
        })
        .then(async res => {
            if (res.ok) {
                // @ts-ignore
                resolve(await res.text())
            } else {
                reject(new Error(res.statusText))
            }
        }, reject)
    })
}

/**
 * @param {string} swaggerPath 
 * @returns {Promise<import("./types.js").SwaggerJson>}
 */
function loadSwaggerSchemaLocal(swaggerPath) {
    return new Promise((resolve, reject) => {
        swaggerPath = pathResolve(void 0, swaggerPath)
        fse.readFile(swaggerPath, "utf-8")
        .then(data => {
            try {
                resolve(processSwaggerData(data, swaggerPath))
            } catch (error) {
                reject(error)
            }
        })
        .catch(reject)
    }) 
}

/**
 * @param {string} swaggerUrl
 * @returns {Promise<import("./types.js").SwaggerJson>}
 */
function loadSwaggerSchemaRemote(swaggerUrl) {
    return fetchSwaggerSchema(swaggerUrl).then(data => processSwaggerData(data, swaggerUrl))
}

/**
 * @param {string} schemaData swagger schema content
 * @param {string} swaggerPath swagger schema path or URL
 * @returns {import("./types.js").SwaggerJson}
 */
function processSwaggerData(schemaData, swaggerPath) {
    const schemaContent = stripBom(schemaData)
    const swaggerJson = swaggerPath.endsWith(".json") ? JSON.parse(schemaContent) : load(schemaContent)
    return swaggerJson
}
/**
 * @param {string} swaggerPathOrUrl
 * @returns {Promise<import("./types.js").SwaggerJson>}
 */
export function loadSwaggerSchema(swaggerPathOrUrl) {
    return isHTTPUrl(swaggerPathOrUrl)
        ? loadSwaggerSchemaRemote(swaggerPathOrUrl)
        : loadSwaggerSchemaLocal(swaggerPathOrUrl)
}
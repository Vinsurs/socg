// @ts-check
import fetch from "node-fetch"
import fse from "fs-extra"
import { pathResolve } from "./path.js"

/**
 * @param {string} swaggerJsonUrl 
 */
export function downLoadSwaggerJson(swaggerJsonUrl, downloadDir = process.cwd()) {
    return new Promise((resolve, reject) => {
        const ws = fse.createWriteStream(pathResolve(downloadDir, "./swagger.json"))
        fetch(swaggerJsonUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/octet-stream",
            },
        })
        .then(res => {
            if (res.body) {
                res.body.pipe(ws)
                res.body.on("end", () => {
                    ws.end()
                    resolve(null)
                })
            }
        }, reject)        
    })
}

/**
 * @param {string} swaggerJsonUrl
 * @returns {Promise<import("./types.js").SwaggerJson>}
 */
export function fetchSwaggerJson(swaggerJsonUrl) {
    // @ts-ignore
    return fetch(swaggerJsonUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(res => res.json())
}
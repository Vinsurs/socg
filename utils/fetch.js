// @ts-check
import fetch from "node-fetch"
import fse from "fs-extra"

/**
 * @param {string} swaggerJsonUrl 
 * @param {string} outputPath 
 */
export function downLoadSwaggerJson(swaggerJsonUrl, outputPath) {
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
 * @returns {Promise<import("./types.js").SwaggerJson>}
 */
export function fetchSwaggerJson(swaggerJsonUrl) {
    return new Promise((resolve, reject) => {
        fetch(swaggerJsonUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(async res => {
            if (res.ok) {
                // @ts-ignore
                resolve(await res.json())
            } else {
                reject(new Error(res.statusText))
            }
        }, reject)
    })
}
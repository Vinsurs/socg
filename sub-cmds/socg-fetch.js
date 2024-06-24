import { Command } from "commander"
import logger from "../utils/logger.js"
import { downLoadSwaggerJson, fetchSwaggerJson } from "../utils/fetch.js"
import { pathResolve } from "../utils/path.js"

const program = new Command()

program
.argument("<url>", "swagger json online url")
.option("-o, --output [path]", "output path, if ignore this option, will use process.stdout to output the content")
.action(function () {
    const url = this.args[0]
    const outputPath = this.opts().output
    if (outputPath) {
        const path = pathResolve(process.cwd(), outputPath)
        logger.info("start downloading swagger json...")
        downLoadSwaggerJson(url, path)
        .then(() => {
            logger.success("download success")
        }, err => {
            logger.error("download failed: ", err.message)
        })
    } else {
        logger.info("start fetching swagger json...")
        fetchSwaggerJson(url)
        .then(data => {
            logger.success("fetch success")
            process.stdout.write(JSON.stringify(data))
        }, err => {
            logger.error("fetch failed: ", err.message)
        })
    }
})

program.parse()
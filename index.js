#!/usr/bin/env node
// @ts-check
import fse from "fs-extra"
import minimist from "minimist"
import { rimrafSync } from "rimraf"
import logger from "./utils/logger.js"
import { pathResolve } from "./utils/path.js"
import { fetchSwaggerJson } from "./utils/fetch.js"
import { getPaths } from "./utils/helper.js"
import { handleSchemas } from "./utils/swagger.js"

import { program } from "commander"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const pkg = require("./package.json")

const args = minimist(process.argv.slice(2), {
    default: {
        "dir": "apis",
        "model": "model.ts",
        "url": "http://192.168.18.169:7100/swagger/v1/swagger.json"
    }
})

const swaggerJsonUrl = args.url
const outDir = pathResolve(args.dir)
const modelFileName = args.model
const modelPath = pathResolve(outDir, modelFileName)

async function bootstrap() {
    const swaggerJson = await fetchSwaggerJson(swaggerJsonUrl)
    logger.success("swagger.json 下载成功")
    logger.info("swagger openapi verson:", swaggerJson.openapi)
    logger.info("api doc title:", swaggerJson.info.title)
    logger.info("api doc version:", swaggerJson.info.version)
    const paths = getPaths(swaggerJson)
    if (paths.length === 0) {
        logger.warn("没有找到有效的接口")
        return
    }
    rimrafSync(outDir, { preserveRoot: true })
    fse.ensureDirSync(outDir)
    logger.info("正在生成接口类型定义文件...")
    const schemaCode = handleSchemas(swaggerJson, modelFileName)
    fse.writeFileSync(modelPath, schemaCode)
    logger.success("接口类型定义文件生成成功")
}

// bootstrap()


program
.name(pkg.name)
.description(pkg.description)
.version(pkg.version)
.executableDir("sub-cmds")
.command("fetch", "get swagger api doc content")
.command("model", "just only generate model file")
.parse()
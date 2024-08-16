// @ts-check
import { createCommand, Option } from "commander"
import fse from "fs-extra"
import { createRequire } from "node:module"
import { pathResolve } from "../utils/path.js"
import { handleSchemas, preHandleSchemas } from "../utils/swagger.js"
import logger from "../utils/logger.js"
import { default as i18n } from "../utils/i18n.js"
import { handleInterfaceSchemas } from "../utils/endpoint.js"

const require = createRequire(import.meta.url)

/** @type {Partial<import("../utils/types.js").GenerateConfig>} */
const defaults = {
    model: "model.ts",
    locale: "en",
    queryParameterName: "query",
    dataParameterName: "data"
}

// load config
let configPath = pathResolve(void 0, "socg.config.js")
if (!fse.existsSync(configPath)) {
    configPath = pathResolve(void 0, "socg.config.cjs")
    if (!fse.existsSync(configPath)) {
        throw new Error("socg configuration file 'socg.config.(c)js' does not found")
    }
}

/** @type {import("../utils/types.js").Config} */
const config = require(configPath)

if (!config || !config.generate || typeof config.generate.template !== "function") {
    throw new Error("you must provide a template function to specify some generate rules to tell us how to generate api interface code in your `socg.config.(c)js`, that means you must configure the 'generate.template' option in you config")
}

const program = createCommand()

program
.argument("<url>", "swagger json online url")
.option("-d, --dir [output-directory]", "the directory in where the generated file will be saved")
.addOption(new Option("-m, --model [model-filename]", "the flle path that related to the `dir` option of the generated model file"))
.addOption(new Option("-l, --locale [locale]", "set i18n locale").choices(i18n.availableLocales))
.action(async function (url, options = {}) {
    options = Object.assign({}, defaults, config.generate, options)
    if (!options.dir) {
        throw new Error("'dir' option is required. you must provide a output directory to save the generated code")
    }
    const nextLocale = options.locale
    if (nextLocale !== i18n.locale && i18n.availableLocales.includes(nextLocale)) {
        i18n.locale = nextLocale
    }
    const outputPath = pathResolve(void 0, options.dir)
    const modelPath = pathResolve(outputPath, options.model)
    try {
        const swaggerJson = await preHandleSchemas(url)
        logger.info(i18n.t("model.start_generate"))
        const schemaCode = handleSchemas(swaggerJson, modelPath)
        fse.emptydirSync(outputPath)
        fse.ensureFileSync(modelPath)
        // @ts-ignore
        fse.writeFileSync(modelPath, schemaCode)
        logger.success(i18n.t("model.generate_success_at"), modelPath)
        logger.info(i18n.t("generate.start_generate"))
        config.generate = options
        await handleInterfaceSchemas(swaggerJson, outputPath, modelPath, config)
        logger.success(i18n.t("generate.finish_generate"))
    } catch (error) {
        logger.warn(error.message)
        process.exit(1)
    }
})
.parseAsync()
// @ts-check
import { createCommand, Option } from "commander"
import fse from "fs-extra"
import { pathResolve } from "../utils/path.js"
import { handleSchemas, preHandleSchemas } from "../utils/swagger.js"
import logger from "../utils/logger.js"
import { default as i18n } from "../utils/i18n.js"
import { handleInterfaceSchemas } from "../utils/endpoint.js"
import { intro, setLineEnding, writeFileToDisk } from "../utils/helper.js"
import { loadConfig } from "../utils/loadConfig.js"

const program = createCommand()

program
.argument("<url>", "swagger schema local path or online url")
.option("-d, --dir [output-directory]", "the directory in where the generated file will be saved")
.addOption(new Option("-m, --model [model-filename]", "the flle path that related to the `dir` option of the generated model file"))
.addOption(new Option("-l, --locale [locale]", "set i18n locale").choices(i18n.availableLocales))
.action(async function (url, options = {}) {
    const config = await loadConfig()
    options = Object.assign({}, config.generate, options)
    if (!options.dir) {
        throw new Error("'dir' option is required. you must provide a output directory to save the generated code")
    }
    const nextLocale = options.locale
    if (nextLocale !== i18n.locale && i18n.availableLocales.includes(nextLocale)) {
        i18n.locale = nextLocale
    }
    const outputPath = pathResolve(void 0, options.dir)
    const modelPath = pathResolve(outputPath, options.model)
    setLineEnding(config.eol)
    const swaggerJson = await preHandleSchemas(url)
    logger.info(i18n.t("model.start_generate"))
    let schemaCode = handleSchemas(swaggerJson, modelPath, config.customEnumMember)
    fse.emptydirSync(outputPath)
    fse.ensureFileSync(modelPath)
    if (schemaCode) {
        const code = config.intro ? intro(schemaCode) : schemaCode
        writeFileToDisk(modelPath, code)
    }
    logger.success(i18n.t("model.generate_success_at"), modelPath)
    logger.info(i18n.t("generate.start_generate"))
    config.generate = options
    await handleInterfaceSchemas(swaggerJson, outputPath, modelPath, config)
    logger.success(i18n.t("generate.finish_generate"))
})
.parseAsync()
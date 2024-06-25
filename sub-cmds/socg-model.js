import { createCommand, Option } from "commander"
import fse from "fs-extra"
import { pathResolve } from "../utils/path.js"
import { handleSchemas, preHandleSchemas } from "../utils/swagger.js"
import logger from "../utils/logger.js"
import { default as i18n } from "../utils/i18n.js"

const program = createCommand()

program
.argument("<url>", "swagger json online url")
.requiredOption("-o, --output <path>", "the path in where the generated model file will be saved")
.addOption(new Option("-l, --locale [locale]", "set i18n locale").preset("en").default("en").choices(i18n.availableLocales))
.action(async function (url, options) {
    const nextLocale = this.opts().locale
    if (nextLocale !== i18n.locale && i18n.availableLocales.includes(nextLocale)) {
        i18n.locale = nextLocale
    }
    const outputPath = pathResolve(void 0, options.output)
    try {
        const swaggerJson = await preHandleSchemas(url)
        logger.info(i18n.t("model.start_generate"))
        const schemaCode = handleSchemas(swaggerJson, outputPath)
        fse.writeFileSync(outputPath, schemaCode)
        logger.success(i18n.t("model.generate_success_at"), outputPath)
    } catch (error) {
        logger.warn(error.message)
        process.exit(1)
    }
})
.parseAsync()
import { Command, Option } from "commander"
import logger from "../utils/logger.js"
import { downLoadSwaggerJson, fetchSwaggerJson } from "../utils/fetch.js"
import { pathResolve } from "../utils/path.js"
import { default as i18n } from "../utils/i18n.js"

const program = new Command()

program
.argument("<url>", "swagger json online url")
.option("-o, --output [path]", "output path, if ignore this option, will use process.stdout to output the content")
.addOption(new Option("-l, --locale [locale]", "set i18n locale").preset("en").default("en"))
.action(function () {
    const nextLocale = this.opts().locale
    if (nextLocale !== i18n.locale && i18n.availableLocales.includes(nextLocale)) {
        i18n.locale = nextLocale
    }
    const url = this.args[0]
    const outputPath = this.opts().output
    if (outputPath) {
        const path = pathResolve(process.cwd(), outputPath)
        logger.info(i18n.t("start_download_x", { name: "swagger json" }))
        downLoadSwaggerJson(url, path)
        .then(() => {
            logger.success(i18n.t("fetch.download_success"))
        }, err => {
            logger.error(i18n.t("fetch.download_fail"), err.message)
        })
    } else {
        logger.info(i18n.t("fetch.start_fetch_x", { name: "swagger json" }))
        fetchSwaggerJson(url)
        .then(data => {
            logger.success(i18n.t("fetch.fetch_success"))
            process.stdout.write(JSON.stringify(data))
        }, err => {
            logger.error(i18n.t("fetch.fetch_fail"), err.message)
        })
    }
})

program.parse()
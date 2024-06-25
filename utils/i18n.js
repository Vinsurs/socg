import { I18n } from "i18n-js"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const translations = require("../translations.json")

const i18n = new I18n(translations, {
    defaultLocale: "en"
})
i18n.availableLocales = Object.keys(translations)
export { i18n as default }
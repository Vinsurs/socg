// @ts-check
const { defineConfig } = require("socg")

module.exports = defineConfig({
    generate: {
        output(code) {
            return `import http from "http";\r\n${code}`
        },
        template({URL, METHOD, QUERY, BODY, RESPONSE}) {
            if (METHOD === "get" || METHOD === "delete") {
                if (QUERY) {
                    return `http.${METHOD}<${RESPONSE}>(${URL}, ${QUERY})`
                }
                return `http.${METHOD}<${RESPONSE}>(${URL})`
            } else {
                if (BODY) {
                    return `http.${METHOD}<${RESPONSE}>(${URL}, ${BODY})`
                }
                return `http.${METHOD}<${RESPONSE}>(${URL})`
            }
        },
        dir: "apis",
        model: "model.ts",
        locale: "zh-CN",
        allowImportingTsExtensions: false,
        verbatimModuleSyntax: false,
        filterTag: ['Media']
    },
    filterEndpoint: ['/api/media/count']
})
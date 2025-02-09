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
        // filterTag: ['Media'],
        rewrite: (path) => path.replace(/^\/api/, '')
    },
    eol: "auto"
    // filterEndpoint: ['/api/media/count']
    // customEnumMember(enumValue) {
    //     if (enumValue.toString().indexOf('=') !== -1) {
    //         const [name, initializer] = enumValue.toString().split('=')
    //         const value = Number(initializer)
    //         return {
    //             name,
    //             initializer: Number.isNaN(value) ? initializer : value
    //         }
    //     }
    // }
})
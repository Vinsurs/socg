# socg

s(swagger)o(openapi)c(code)g(generate) is a swagger model and api code generator for javascript.

### install

```
npm install -g socg
```

### usage

```bash
socg -h
```

### example

+ just only generate typescript model file
```bash
socg model http://example.swagger.io/v2/swagger.json -o types/api.ts --locale en
```
+ generate both typescript model file and api file
```bash
socg generate http://example.swagger.io/v1/swagger.json -d apis/ -m model.ts -l zh-CN
```
### config

`socg` is configurable, that means you can customize generation with a config file called `socg.config.(c)js` in your project root directory.

here is a example configuration:

```js
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
        // fit typescript allowImportingTsExtensions option, default is true
        allowImportingTsExtensions: false,
        // fit typescript verbatimModuleSyntax option, default is true
        verbatimModuleSyntax: false,
        // support filter tags
        filterTag: ['Media'],
        rewrite: (path) => path.replace(/^\/api/, ''),
        // ...otherOptions
    },
    // support filter endpoints, but currently only support generate command.
    filterEndpoint: ['/api/media/count'],
    // default is `true` so you can also ignore this.
    intro: true
})
```
then you can just config a npm script to generate your api code in your package.json:

```json
{
    "scripts": {
        "generate": "socg generate http://example.swagger.io/v1/swagger.json"
    }
}
```
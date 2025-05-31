# socg

**s**(swagger)**o**(openapi)**c**(code)**g**(generate) is a swagger OpenApi code generator for javascript. It turns OpenAPI schemas into TypeScript quickly using Node.js and the code is **MIT-licensed** and free for use. 

### Features

+ Supports OpenAPI 3.x
+ Generate runtime-free model types and api endpoint fecher for fetch client
+ Load schemas from YAML or JSON, locally or remotely
+ Generate types for even huge schemas within milliseconds
+ **Highly-Configurable**, socg is configurable to make it easy to use any fetch client you like with `generate.template` option in your config file(socg.config.{cjs,mjs,js,cts,mts,ts})
+ Super easy to use

### Install

```
npm install -g socg
```
or install as a local dependency and then add npm scripts to package.json to play with it
```
npm install -D socg
```
### Usage

```bash
socg -h
```

### Example

+ just only generate typescript model file
```bash
socg model http://example.swagger.io/v2/swagger.json -o types/api.ts --locale en
# you can also load schemas from local file:
# socg model ./path/to/swagger.json
```
+ generate both typescript model file and api file
```bash
socg generate http://example.swagger.io/v1/swagger.json -d apis/ -m model.ts -l zh-CN
# you can also load schemas of yaml format:
# socg generate ./path/to/swagger.yaml
```
### Config

`socg` is configurable, that means you can customize generation with a config file called `socg.config.{cjs,mjs,js,cts,mts,ts}` in your project root directory.

> Note: if you use `socg generate` command, do not forget to set `generate.template` option to tell us how you want to generate api fetcher for fetch client. This option is **required** in this scenario.

here is a example configuration:

```js
// socg.config.cjs
const { defineConfig } = require("socg")
// or `socg.config.mjs`
// import { defineConfig } from "socg"

module.exports = defineConfig({
    generate: {
        output(code) {
            return [
                `import http from "http";`,
                code
            ].join('\r\n')
        },
        template({URL, METHOD, QUERY, BODY, RESPONSE, REQUESTCONTENTTYPE}) {
            if (METHOD === "get" || METHOD === "delete") {
                if (QUERY) {
                    return `http.${METHOD}<${RESPONSE}>(${URL}, ${QUERY})`
                }
                return `http.${METHOD}<${RESPONSE}>(${URL})`
            } else {
                // you can specify the request content type according to the `REQUESTCONTENTTYPE` value
                const contentType = REQUESTCONTENTTYPE === "form_data" ? "multipart/form-data" : "application/json"
                if (BODY) {
                    return `http.${METHOD}<${RESPONSE}>(${URL}, ${BODY}, {
                        "Content-Type": "${contentType}"
                    })`
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
        // filterTag: ['Media'],
        rewrite: (path) => path.replace(/^\/api/, ''),
        // ...otherOptions
    },
    // support filter endpoints, but currently only support generate command.
    // filterEndpoint: ['/api/media/count'],
    // default is `true` so you can also ignore this.
    intro: true,
    // set line endings for output code.
    // eol: 'auto',
    // you can use `customEnumMember` option to custom enum type key.
    // customEnumMember(enumValue) {
    //   return {name: 'enum_member_key', initializer: 'enum_member_value'}
    // }
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

> Tip: If you don't want to see a large area of output information on the console anymore, you can disable the console output through the "**silent**" option.

### License

MIT
// @ts-check
import { loadConfig as _loadConfig } from "unconfig"

/** @type {Partial<import("./types.js").GenerateConfig>} */
const defaultGenerateConfig = {
    model: "model.ts",
    locale: "en",
    queryParameterName: "query",
    dataParameterName: "data",
}

/** @returns {Promise<import("./types.js").Config>} */
export async function loadConfig() {
    const result = await _loadConfig({
        sources: [
            {
                files: ["socg.config"],
                extensions: ['mts', 'cts', 'ts', 'mjs', 'cjs', 'js'],
                async rewrite(_config) {
                    /** @type {import("./types.js").Config}*/
                    const config = await (typeof _config === "function" ? _config() : _config)
                    if (!config || !config.generate || typeof config.generate.template !== "function") {
                        throw new Error("you must provide a template function to specify some generate rules to tell us how to generate api interface code in your `socg.config.(cjs|mjs|js|cts|mts|ts)`, that means you must configure the 'generate.template' option in your config")
                    }
                    if (typeof config.intro === "undefined") {
                        config.intro = true
                    }
                    return {
                        ...config,
                        generate: {
                            ...defaultGenerateConfig,
                            ...config.generate,
                        }
                    }
                }
            }
        ]
    })
    if (result.sources.length === 0) {
        throw new Error("socg configuration file 'socg.config.(cjs|mjs|js|cts|mts|ts)' does not found")
    }
    return result.config
}
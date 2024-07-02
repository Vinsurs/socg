// @ts-check
import { generateEnumDeclaration, isEnumProperty } from "./enum.js";
import { fetchSwaggerJson } from "./fetch.js";
import { addComment, generate, generateExportDeclaration, getPaths } from "./helper.js"
import { generateInterfaceDeclaration } from "./interface-ts.js";
import logger from "./logger.js";
import { default as i18n } from "./i18n.js";


/** handle generate typescript model file
 * @param {import("./types.js").SwaggerJson} swaggerJson swagger json object
 * @param {string} modelFileName model file name that used in warning messages
 * @returns {string | null} generated model code
 */
export function handleSchemas(swaggerJson, modelFileName) {
    const schemas = swaggerJson.components.schemas
    if (!schemas) return null;
    const schemaKeys = Object.keys(schemas)
    if (schemaKeys.length == 0) return null;
    const body = schemaKeys.map(schemaKey => handleSchema(schemaKey, schemas[schemaKey]))
    return generate(modelFileName, body).code
}

/**
 * @param {string} schemaKey 
 * @param {import("./types.js").SchemaProperty} schema 
 * @returns {import("@babel/types").Statement}
 */
export function handleSchema(schemaKey, schema) {
    const exportDeclaration = generateExportDeclaration(
        isEnumProperty(schema) ? generateEnumDeclaration(schemaKey, schema.enum) : generateInterfaceDeclaration(schemaKey, schema.properties)
    )
    addComment(exportDeclaration, schema.description)
    return exportDeclaration
}

/**
 * @param {string} swaggerJsonUrl 
 */
export async function preHandleSchemas(swaggerJsonUrl) {
    logger.info(i18n.t("start_download_x", { name: "swagger json" }))
    const swaggerJson = await fetchSwaggerJson(swaggerJsonUrl)
    logger.success(i18n.t("dwonload_success_x", { name: "swagger json" }))
    logger.info(i18n.t("openapi_version"), swaggerJson.openapi)
    logger.info(i18n.t("doc_title"), swaggerJson.info.title)
    logger.info(i18n.t("doc_version"), swaggerJson.info.version)
    const paths = getPaths(swaggerJson.paths)
    if (paths.length === 0) {
        return Promise.reject(new Error(i18n.t("no_paths_in_json")))
    }
    return swaggerJson
}
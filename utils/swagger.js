// @ts-check
import { generateEnumDeclaration, isEnumProperty } from "./enum.js";
import { fetchSwaggerSchema, loadSwaggerSchema } from "./fetch.js";
import { addComment, generate, generateExportDeclaration, getPaths } from "./helper.js"
import { generateInterfaceDeclaration } from "./interface-ts.js";
import logger from "./logger.js";
import { default as i18n } from "./i18n.js";


/** handle generate typescript model file
 * @param {import("./types.js").SwaggerJson} swaggerJson swagger schema object
 * @param {string} modelFileName model file name that used in warning messages
 * @param {import("./types.js").Config['customEnumMember']} [customEnumMember]
 * @returns {string | null} generated model code
 */
export function handleSchemas(swaggerJson, modelFileName, customEnumMember) {
    const schemas = swaggerJson.components.schemas
    if (!schemas) return null;
    const schemaKeys = Object.keys(schemas)
    if (schemaKeys.length == 0) return null;
    const body = schemaKeys.map(schemaKey => handleSchema(schemaKey, schemas[schemaKey], customEnumMember))
    return generate(modelFileName, body).code
}

/**
 * @param {string} schemaKey 
 * @param {import("./types.js").SchemaProperty} schema 
 * @param {import("./types.js").Config['customEnumMember']} [customEnumMember]
 * @returns {import("@babel/types").Statement}
 */
export function handleSchema(schemaKey, schema, customEnumMember) {
    const exportDeclaration = generateExportDeclaration(
        isEnumProperty(schema) ? generateEnumDeclaration(schemaKey, schema.enum, customEnumMember) : generateInterfaceDeclaration(schemaKey, schema.properties)
    )
    addComment(exportDeclaration, schema.description)
    return exportDeclaration
}

/**
 * @param {string} swaggerJsonUrl swagger schema local path or online url
 */
export async function preHandleSchemas(swaggerJsonUrl) {
    logger.info(i18n.t("start_download_x", { name: "swagger schema" }))
    const swaggerJson = await loadSwaggerSchema(swaggerJsonUrl)
    logger.success(i18n.t("dwonload_success_x", { name: "swagger schema" }))
    logger.info(i18n.t("openapi_version"), swaggerJson.openapi)
    logger.info(i18n.t("doc_title"), swaggerJson.info.title)
    logger.info(i18n.t("doc_version"), swaggerJson.info.version)
    const paths = getPaths(swaggerJson.paths)
    if (paths.length === 0) {
        return Promise.reject(new Error(i18n.t("no_paths_in_json")))
    }
    return swaggerJson
}
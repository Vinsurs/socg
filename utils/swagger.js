// @ts-check
import { generateEnumDeclaration, isEnumProperty } from "./enum.js";
import { fetchSwaggerJson } from "./fetch.js";
import { addComment, generate, generateExportDeclaration, getPaths } from "./helper.js"
import { generateInterfaceDeclaration } from "./interface-ts.js";
import logger from "./logger.js";


/**
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
    logger.info("start downloading swagger json file...")
    const swaggerJson = await fetchSwaggerJson(swaggerJsonUrl)
    logger.success("swagger json downloaded successfully")
    logger.info("swagger openapi verson:", swaggerJson.openapi)
    logger.info("api doc title:", swaggerJson.info.title)
    logger.info("api doc version:", swaggerJson.info.version)
    const paths = getPaths(swaggerJson)
    if (paths.length === 0) {
        return Promise.reject(new Error("no paths found in swagger json"))
    }
    return swaggerJson
}
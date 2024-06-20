// @ts-check
import { generateEnumDeclaration, isEnumProperty } from "./enum.js";
import { addComment, generate, generateExportDeclaration } from "./helper.js"
import { generateInterfaceDeclaration } from "./interface-ts.js";


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


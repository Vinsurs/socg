// @ts-check
import generator from "@babel/generator"
import * as t from "@babel/types"

/** @type {import("@babel/generator").default} */
const _generate = 
// @ts-ignore
generator.default

/**
 * @param {Record<string, any>} paths 
 */
export function getPaths(paths) {
    return Object.keys(paths).filter(path => path && path !== "/")
}

/** 
 * @param {import("./types.js").SchemaProperty} property
 * @returns {import("./types.js").SchemaPropertyType | string}
 */
export function mapPropertyType(property) {
    const { type, $ref } = property
    if ($ref) {
        return getRefType($ref)
    }
    switch (type) {
        case "string":
            return "string"
        case "number":
        case "int":
        case "int32":
        case "integer":
            return "number"
        case "boolean":
            return "boolean"
        case "array":
            return "Array"
        case "object":
            return "object"
        default:
            return "unknown"
    }
}

/**
 * @param {import("./types.js").SchemaProperty["$ref"]} $ref eg."#/components/schemas/ByPartItem"
 * @returns {string} retrieve referenced type eg."ByPartItem"
 */
export function getRefType($ref) {
    // @ts-ignore
    return $ref.split("/").pop()
}

/**
 * @param {import("@babel/types").Node} node 
 * @param {string} [comment] 
 */
export function addComment(node, comment) {
    if (comment) {
        t.addComments(node, "leading", [
            { type: "CommentBlock", value: `* ${comment} ` }
        ])
    }
}

/**
 * @param {import("@babel/types").Declaration} declaration
 * @param {boolean} [named=true]
 * @returns {import("@babel/types").ExportNamedDeclaration | import("@babel/types").ExportDefaultDeclaration}
 */
export function generateExportDeclaration(declaration, named = true) {
    // @ts-ignore
    return named ? t.exportNamedDeclaration(declaration) : t.exportDefaultDeclaration(declaration)
}

/**
 * code generation
 * @param {string} filename 
 * @param {Array<import("@babel/types").Statement>} body 
 * @param {Array<import("@babel/types").Directive>} directives 
 * @returns 
 */
export function generate(filename, body = [], directives = []) {
    const program = t.program(body, directives, "module", null)
    return _generate(program, { filename })
}
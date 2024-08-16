// @ts-check
import generator from "@babel/generator"
import * as t from "@babel/types"

/** @type {import("@babel/generator").default} */
const _generate = 
// @ts-ignore
generator.default

/**
 * @param {import("./types.js").SwaggerPaths} paths 
 */
export function getPaths(paths) {
    return Object.keys(paths).filter(path => path && path !== "/")
}

/** 
 * @param {import("./types.js").SchemaProperty} property
 * @returns {import("./types.js").MappedPropertyType}
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
        case "bool":
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
    return normalizeId($ref.split("/").pop())
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

/**
 * generate import declaration
 * @param {string} source 
 * @param {string[]} locals
 * @param {Pick<import("./types.js").GenerateConfig, "allowImportingTsExtensions" | "verbatimModuleSyntax">} [options]
 */
export function generateImportDeclaration(source, locals, options) {
    options = Object.assign({}, {
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true
    }, options)
    const specifiers = locals.map(local => {
        return t.importSpecifier(t.identifier(local), t.identifier(local))
    })
    if (!options.allowImportingTsExtensions) {
        source = source.replace(/\.ts$/, "")
    }
    const node = t.importDeclaration(specifiers, t.stringLiteral(source))
    node.importKind = options.verbatimModuleSyntax ? "value" : "type"
    return node
}

/**
 * @param {import("./types.js").RouteParam[]} params 
 * @param {string} [description] 
 */
export function generateFuncComments(params, description) {
    let comment = ""
    if (description) {
        comment += `${description}\n`
        if (params.length === 0) {
            comment = comment.replace("\n", "")
        }
    }
    if (params.length) {
        if (!description) {
            comment += `\n`
        }
        params.forEach(param => {
            comment += ` * @param {${param.type}} ${param.name} ${param.description}\n`
        })
    }
    return comment
}

/**
 * @param {string} id 
 */
export function normalizeId(id) {
    return id.replace(/[`'"]/g, "")
}
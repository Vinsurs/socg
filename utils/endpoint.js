// @ts-check
import * as t from "@babel/types"
import fse from "fs-extra"
import { camelCase, pascalCase } from "case-anything"
import { addComment, generate, generateFuncComments, generateImportDeclaration, getPaths, mapPropertyType } from "./helper.js";
import { handleSchema } from "./swagger.js";
import { default as i18n } from "./i18n.js";
import { pathRelative, pathResolve } from "./path.js";
import logger from "./logger.js";

/** @type {import("./types.js").Config | null} */
let config = null
const routeParamsReg = /\{\w+\}/g
const queryParameterName = "query"
const dataParameterName = "data"
/** handle backend api interface file generation
 * @param {import("./types.js").SwaggerJson} swaggerJson swagger json object
 * @param {string} outputPath output path
 * @param {string} modelPath model path
 * @param {import("./types.js").Config} configuaration configuration
 */
export async function handleInterfaceSchemas(swaggerJson, outputPath, modelPath, configuaration) {
    config = configuaration
    const paths = getPaths(swaggerJson.paths)
    if (paths.length === 0) {
        return Promise.reject(new Error(i18n.t("no_paths_in_json")))
    }
    /** @type {import("./types.js").TagsMapper} */
    const tagsMapper = {}
    swaggerJson.tags.forEach(tag => {
        tagsMapper[tag.name] = {
            ...tag,
            endpoints: []
        }
    })
    paths.forEach(endpoint => {
        const endpointDefinition = swaggerJson.paths[endpoint]
        const keys = Object.keys(endpointDefinition)
        if (keys.length > 0) {
            /** @type {import("./types.js").MethodDefinition} */
            const firstDefinition = endpointDefinition[keys[0]]
            const tag = firstDefinition.tags[0]
            if (tag && tagsMapper[tag]) {
                tagsMapper[tag].endpoints.push({
                    endpoint,
                    endpointDefinition
                })
            }
        }
    })
    const tags = Object.keys(tagsMapper)
    for (const tag of tags) {
        const tagMapper = tagsMapper[tag]
        generateTagInterface(tagMapper, outputPath, modelPath)
    }
}

/**
 * @param {import("./types.js").TagMapper} tagMapper 
 * @param {string} outputPath 
 * @param {string} modelPath 
 */
function generateTagInterface(tagMapper, outputPath, modelPath) {
    const filename = `${camelCase(tagMapper.name)}/index.ts`
    const filePath = pathResolve(outputPath, filename)
    logger.info(i18n.t("generate.generate_endpoint"), filename)
    fse.ensureFileSync(filePath)
    let content = generateTagInterfaceContent(tagMapper, filePath, modelPath)
    if (config && config.generate && typeof config.generate.output === "function") {
        content = config.generate.output(content)
    }
    fse.writeFileSync(filePath, content)
    logger.info(i18n.t("generate.generate_endpoint_x_finished", { name: filename }))
}

/**
 * @param {import("./types.js").TagMapper} tagMapper 
 * @param {string} filePath 
 * @param {string} modelPath 
 */
function generateTagInterfaceContent(tagMapper, filePath, modelPath) {
    /** @type {Array<import("./types.js").Statement>} */
    const body = []
    /** @type {Set<string>} */
    const queryTypes = new Set()
    /** @type {import("./types.js").Statement[]} */
    const queryNodes = []
    /** @type {Set<string>} */
    const modelTypes = new Set()
    tagMapper.endpoints.forEach(({endpoint, endpointDefinition}) => {
        Object.keys(endpointDefinition).forEach(method => {
            // @ts-ignore
            const { queryTypeIdentifier, queryNode, declarationNode, bodyTypeIdentifier, responseTypeIdentifier } = generateExportEndpointFetch(endpoint, method, endpointDefinition[method])
            if (queryTypeIdentifier) {
                queryTypes.add(queryTypeIdentifier)
            }
            if (queryNode) {
                queryNodes.push(queryNode)
            }
            if (bodyTypeIdentifier) {
                modelTypes.add(bodyTypeIdentifier)
            }
            if (responseTypeIdentifier) {
                modelTypes.add(responseTypeIdentifier)
            }
            body.push(declarationNode)
        })
    })
    // handle importers
    // handle model types import
    const modelSource = pathRelative(filePath, modelPath)
    const modelImporters = generateImportDeclaration(modelSource, Array.from(modelTypes))
    body.unshift(modelImporters)
    // handle query types import
    const queryFilename = `model.ts`
    const queryFilepath = pathResolve(filePath, "..", queryFilename)
    const querySource = pathRelative(filePath, queryFilepath)
    const queryImporters = generateImportDeclaration(querySource, Array.from(queryTypes))
    body.unshift(queryImporters)
    // handle query types file generation
    logger.info(i18n.t("generate.generate_query_types_x", { name: queryFilename }))
    try {
        const queryFileContent = generate(queryFilepath, queryNodes).code
        fse.ensureFileSync(queryFilepath)
        fse.writeFileSync(queryFilepath, queryFileContent)
        logger.success(i18n.t("generate.generate_query_types_x_finished", { name: queryFilename }))
    } catch (error) {
        logger.error(i18n.t("generate.generate_query_types_fail_x", { name: queryFilename }))
    }
    // handle endpoint api file generation
    return generate(filePath, body).code
}

/**
 * @param {string} path - endPoint path
 * @param {import("./types.js").EndpointMethod} method - endpoint method
 * @param {import("./types.js").MethodDefinition} methodDefinition - endpoint method definition
 */
function generateExportEndpointFetch(path, method, methodDefinition) {
    const funcName = makeEndpointFetchName(path, method)
    const { routeParams, queryTypeIdentifier, node } = handleQueryAndParams(methodDefinition, () => makeEndpointFetchQueryType(path, method))
    const responseType = mapPropertyType(methodDefinition.responses["200"].content["application/json"].schema)
    let bodyTypeIdentifier = ""
    /** @type {Parameters<import("./types.js").EndpointTemplate>["0"]} */
    const info = {
        URL: `"${path}"`,
        METHOD: method,
        RESPONSE: responseType,
    }
    if (routeParams) {
        info.URL = handlePathRouteParams(path)
    }
    if (queryTypeIdentifier) {
        info.QUERY = queryParameterName
    }
    if (methodDefinition.requestBody) {
        info.BODY = dataParameterName
        bodyTypeIdentifier = mapPropertyType(methodDefinition.requestBody.content["application/json"].schema)
    }
    const returnExpression = config ? config.generate.template(info) : ""
    const declarationNode = generateEndpointFetchExportDeclaration({funcName, routeParams, queryTypeIdentifier, returnExpression, endpointComment: methodDefinition.summary, bodyTypeIdentifier})
    return {
        queryTypeIdentifier,
        queryNode: node,
        declarationNode,
        bodyTypeIdentifier,
        responseTypeIdentifier: info.RESPONSE
    }
}

/**
 * @param {string} path - endpoint path
 */
function handlePathRouteParams(path) {
    const s = path.replace(routeParamsReg, function (match) {
        return '$' + match
    })
    return `\`${s}\``
}

/**
 * @param {string} path - endpoint path
 * @param {import("./types.js").EndpointMethod} method - endpoint method
 * @returns {string} endpoint fetch function name
 */
function makeEndpointFetchName(path, method) {
    const last = path.indexOf("{")
    const sements = path.slice(0, last - 1).split("/")
    return camelCase([method, sements].join("-"))
}

/** function to generate fetch query type
 * @param {string} path - endpoint path
 * @param {import("./types.js").EndpointMethod} method - endpoint method
 * @returns {string}
 */
function makeEndpointFetchQueryType(path, method) {
    const last = path.indexOf("{")
    const sements = path.slice(0, last - 1).split("/")
    return pascalCase([method, sements].join("-").concat("Query"))
}

/**
 * @param {import("./types.js").MethodDefinition} methodDefinition - endpoint method definition
 * @param {() => string} queryTypeGeneratorFn - function to generate fetch query type
 * @returns {{routeParams: import("./types.js").FetchExportOptions["routeParams"]; queryTypeIdentifier?: string; node: import("./types.js").Statement|null;}}
 */
function handleQueryAndParams(methodDefinition, queryTypeGeneratorFn) {
    /** @type {import("./types.js").FetchExportOptions["routeParams"]} */
    let routeParams = null
    /** @type {string | undefined} */
    let queryTypeIdentifier = void 0
    /** @type {import("./types.js").Statement | null} */
    let node = null
    /** @type {import("./types.js").SchemaProperty} */
    const schema = {
        description: (methodDefinition.summary || "").concat(i18n.t("query_params")),
    }
    if (methodDefinition.parameters) {
        methodDefinition.parameters.forEach(parameter => {
            if (parameter.in === "path") {
                if (!routeParams) {
                    routeParams = {}
                }
                routeParams = {
                    [parameter.name]: {
                        name: parameter.name,
                        type: mapPropertyType(parameter.schema),
                        description: parameter.description
                    }
                }
            } else if (parameter.in === "query") {
                if (!schema.properties) {
                    schema.properties = {}
                }
                schema.properties[parameter.name] = {
                    description: parameter.description,
                    nullable: !parameter.required,
                    ...parameter.schema
                }
            }
        })
    }
    if (schema.properties) {
        queryTypeIdentifier = queryTypeGeneratorFn()
        node = handleSchema(queryTypeIdentifier, schema)
    }
    return {
        routeParams,
        queryTypeIdentifier,
        node
    }
}

/**
 * @param {import("./types.js").FetchExportOptions} fetchExportOptions 
 */
function generateEndpointFetchExportDeclaration({funcName, routeParams, queryTypeIdentifier, returnExpression, endpointComment, bodyTypeIdentifier}) {
    // funciton name
    const functionName = t.identifier(funcName)
    // function parameters
    const params = []
    /** @type {Array<import("./types.js").RouteParam>} */
    const paramsForComment = []
    // whether has route params
    if (routeParams) {
        const routeParamsKeys = Object.keys(routeParams)
        routeParamsKeys.forEach(key => {
            const paramNode = generateFuncParameter(key, routeParams[key].type)
            params.push(paramNode)
            paramsForComment.push(routeParams[key])
        })
    }
    if (queryTypeIdentifier) {
        const queryNode = generateFuncParameter(queryParameterName, queryTypeIdentifier)
        params.push(queryNode)
    }
    if (bodyTypeIdentifier) {
        const dataNode = generateFuncParameter(dataParameterName, bodyTypeIdentifier)
        params.push(dataNode)
    }
    // function body
    const body = []
    const returnStatement = t.returnStatement(t.identifier(returnExpression))
    body.push(returnStatement)
    const block = t.blockStatement(body)
    const declaration = t.functionDeclaration(
        functionName,
        params,
        block
    )
    const node = t.exportNamedDeclaration(declaration)
    addComment(node, generateFuncComments(paramsForComment, endpointComment))
    return node
}

/**
 * generate function parameter node
 * @param {string} paramName 
 * @param {string} paramType 
 */
function generateFuncParameter(paramName, paramType) {
    const paramNode = t.identifier(paramName)
    paramNode.typeAnnotation = t.typeAnnotation(t.genericTypeAnnotation(t.identifier(paramType)))
    return paramNode
}


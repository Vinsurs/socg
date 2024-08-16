// @ts-check
// pure type definition file
export {}

/**
 * @typedef {object} Config
 * @property {FetchComfig} [fetch] - configuration for fetch command
 * @property {ModelComfig} [model] - configuration for model command
 * @property {GenerateConfig} generate - configuration for generate command
 * @property {string[] | ((endpoint: string) => boolean)} [filterEndpoint] - function to filter endpoints. currently only support `generate` command.
 */

/**
 * @typedef {{}} FetchComfig
 */

/**
 * @typedef {{}} ModelComfig
 */

/**
 * @typedef {object} GenerateConfig
 * @property {TemplateOutput} [output] - function to output final code
 * @property {EndpointTemplate} template - template configuration for code generatation. you must specify this to tell the generator how to generate api interface code
 * @property {string} [dir] - the directory in where the generated file will be saved. you must specify this neither in config nor in command line
 * @property {string} [model] - the flle path that related to the `dir` option of the generated model file, default is `model.ts`
 * @property {"en"|"zh-CN"} [locale] - set i18n locale, default is `en`
 * @property {string[] | ((tag: string) => boolean)} [filterTag] - function to filter tags
 * @property {boolean} allowImportingTsExtensions - fit typescript `allowImportingTsExtensions` option, default is `true`
 * @property {boolean} verbatimModuleSyntax - fit typescript `verbatimModuleSyntax` option, default is `true`
 */

/**
 * @callback TemplateOutput
 * @param {string} code - generated code
 * @returns {string} - final code
 */

/**
 * @callback EndpointTemplate
 * @param {object} info - endpoint info for generate template code
 * @param {string} info.URL - endpoint url
 * @param {EndpointMethod} info.METHOD - endpoint method
 * @param {string} [info.QUERY] - endpoint query variable name if query exists
 * @param {string} [info.BODY] - endpoint request body variable name if request body exists
 * @param {string} info.RESPONSE - endpoint response type name
 * @returns {string}
 */

/**
 * @typedef {object} SwaggerJson Swagger JSON object
 * @property {string} openapi - openapi version
 * @property {object} info - api json info object
 * @property {string} info.title - api json doc title
 * @property {string} info.version - api json doc version
 * @property {SwaggerPaths} paths - api json paths object
 * @property {{schemas: Schemas;}} components - api json components object
 * @property {Array<{name: string; description: string;}>} tags - api json tags object
 */

/**
 * @typedef {{[endpoint: string]: EndpointDefinition}} SwaggerPaths
 */

/** @typedef {"get"|"post"|"put"|"delete"} EndpointMethod */

/**
 * @typedef {{[method in EndpointMethod]: MethodDefinition}} EndpointDefinition
 */

/**
 * @typedef {object} MethodDefinition
 * @property {string[]} tags - the tag that the api endpoint belongs to
 * @property {string} summary - endpint description
 * @property {Array<EndpointParameter>} parameters - endpint response
 * @property {EndpointResponse} requestBody - endpint request body
 * @property {{[statusCode: string]: EndpointResponse}} responses - endpint response
 */

/** @typedef {"application/json" | "multipart/form-data"} ContentType */

/**
 * @typedef {object} EndpointResponse
 * @property {string} description - response description
 * @property {{[contentType in ContentType]: {schema: {$ref: string;}}}} content - response body
 */

/**
 * @typedef {object} EndpointParameter
 * @property {string} name - parameter name
 * @property {"path" | "query"} in - parameter location
 * @property {string} description - parameter description
 * @property {string} required - whether parameter is required
 * @property {SchemaProperty} schema - parameter schema
 */

/** 
 * @typedef {{[schemaKey: string]: SchemaProperty}} Schemas
 */

/** @typedef {"string" | "number" | "int" | "int32" | "integer" | "bool" | "boolean" | "array" | "object"} SchemaPropertyType schema property type*/

/** 
 * @typedef {object} SchemaProperty schema property definition
 * @property {SchemaPropertyType} [type] - property type
 * @property {Schemas} [properties] - child properties
 * @property {SchemaProperty | false} [additionalProperties] - extra properties
 * @property {string} [description] - property description
 * @property {"int32"} [format] - property integer type
 * @property {boolean} [nullable] - whether property can be null
 * @property {SchemaProperty} [items] - when type is array, this is the array item type
 * @property {string} [$ref] - when type is object, this is the object reference; eg."#/components/schemas/ByPartItem"
 * @property {Array<EnumValue>} [enum] - when type is integer or string, this is the enum values
 * @property {*} [default] - default value
*/

/** 
 * @typedef {object} JSPropertyDefinition
 * @property {"js"} kind - language kind
 * @property {import("@babel/types").FlowType} node - property type Node
 */

/** 
 * @typedef {object} TSPropertyDefinition
 * @property {"ts"} kind - language kind
 * @property {import("@babel/types").TSTypeAnnotation} node - property type Node
 */

/** @typedef {JSPropertyDefinition | TSPropertyDefinition} PropertyDefinition */

/**
 * @typedef {Object} ProcessedPropertyDefinition
 * @property {string} key - property name
 * @property {PropertyDefinition} type - property type
 * @property {boolean} optional - property is optional
 * @property {string} [comment] - property comment content
 */

/**
 * @typedef {Object} ProcessedEnumDefinition
 * @property {string} name - enum name
 * @property {EnumValue} value - enum value
 */

/** @typedef {string | number | boolean} EnumValue enum member type*/

/**
 * @typedef {{[segment: string]: RouteParam}} RouteParams
 */

/**
 * @typedef {object} RouteParam
 * @property {string} name - param name
 * @property {string} type - param type
 * @property {string} description - param description
 */

/**
 * @typedef {object} FetchExportOptions
 * @property {string} funcName - function name
 * @property {RouteParams|null} routeParams - endpoint route params
 * @property {string} [queryTypeIdentifier] - endpoint query type identifier
 * @property {string} returnExpression - endpoint fetch return expression
 * @property {string} [endpointComment] - endpoint comment
 * @property {string} [bodyTypeIdentifier] - endpoint request body type identifier
 */

/** @typedef {import("@babel/types").Node} Node */

/** @typedef {import("@babel/types").Statement} Statement */

/** @typedef {{[tagName: string]: TagMapper}} TagsMapper */

/** @typedef {SwaggerJson["tags"][number] & {endpoints: Array<TagsMapperEndpoint>}} TagMapper */

/** 
 * @typedef {object} TagsMapperEndpoint
 * @property {string} endpoint - endpoint path
 * @property {EndpointDefinition} endpointDefinition - endpoint definition
 */
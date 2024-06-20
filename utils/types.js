// @ts-check
// pure type definition file
export {}
/**
 * @typedef {object} SwaggerJson Swagger JSON object
 * @property {string} openapi - openapi version
 * @property {object} info - api json info object
 * @property {string} info.title - api json doc title
 * @property {string} info.version - api json doc version
 * @property {object} paths - api json paths object
 * @property {{schemas: Schemas;}} components - api json components object
 * @property {Array<{name: string; description: string;}>} tags - api json tags object
 */

/** 
 * @typedef {{[schemaKey: string]: SchemaProperty}} Schemas
 */

/** @typedef {"string" | "number" | "int" | "int32" | "integer" | "boolean" | "array" | "object"} SchemaPropertyType schema property type*/

/** 
 * @typedef {Object} SchemaProperty schema property definition
 * @property {SchemaPropertyType} type - property type
 * @property {Schemas} properties - child properties
 * @property {SchemaProperty | false} additionalProperties - extra properties
 * @property {string} description - property description
 * @property {string} description - property description
 * @property {"int32"} format - property integer type
 * @property {boolean} nullable - whether property can be null
 * @property {SchemaProperty} items - when type is array, this is the array item type
 * @property {string} $ref - when type is object, this is the object reference; eg."#/components/schemas/ByPartItem"
 * @property {Array<EnumValue>} enum - when type is integer or string, this is the enum values
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

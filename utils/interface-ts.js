// @ts-check
import * as t from "@babel/types"
import { addComment, mapPropertyType, normalizeId } from "./helper.js"

/**
 * @param {string} interfaceName
 * @param {import("./types.js").SchemaProperty["properties"]} properties
 * @param {import("@babel/types").TSTypeParameterDeclaration | null} [typeParameters]
 * @returns {import("@babel/types").TSInterfaceDeclaration}
 */
export function generateInterfaceDeclaration(interfaceName, properties, typeParameters = null) {
    interfaceName = normalizeId(interfaceName)
    const id = t.identifier(interfaceName)
    const body = generateInterfaceBody(mapPropertiesToDefinition(properties))
    return t.tSInterfaceDeclaration(id, typeParameters, null, body)
}

/**
 * @param {Array<import("./types.js").ProcessedPropertyDefinition>} propertyDefinitions
 * @returns {import("@babel/types").TSInterfaceBody}
 */
export function generateInterfaceBody(propertyDefinitions) {
    const properties = propertyDefinitions.map(generatePropertySignature)
    return t.tSInterfaceBody(properties)
}

/**
 * @param {import("./types.js").ProcessedPropertyDefinition} propertyDefinition
 * @returns {import("@babel/types").TSPropertySignature}
 */
export function generatePropertySignature({ key, type, optional, comment }) {
    // @ts-ignore
    const node = t.tSPropertySignature(t.identifier(key), type.node)
    node.optional = optional
    addComment(node, comment)
    return node
}

/**
 * @param {import("./types.js").SchemaProperty["properties"]} properties 
 * @returns {Array<import("./types.js").ProcessedPropertyDefinition>}
 */
export function mapPropertiesToDefinition(properties) {
    if (!properties) {
        return []
    }
    return Object.keys(properties).map(propertyName => mapPropertyToDefinition(propertyName, properties[propertyName]))
}

/**
 * @param {string} propertyName 
 * @param {import("./types.js").SchemaProperty} property 
 * @returns {import("./types.js").ProcessedPropertyDefinition}
 */
export function mapPropertyToDefinition(propertyName, property) {
    return {
        key: propertyName,
        type: {
            kind: "ts",
            node: getPropertyTypeAnnotation(property)
        },
        optional: !!property.nullable,
        comment: property.description
    }
}

/** 
 * @param {import("./types.js").SchemaProperty} property
 * @returns {import("@babel/types").TSTypeAnnotation}
 */
export function getPropertyTypeAnnotation(property) {
    return t.tSTypeAnnotation(getPropertyType(property))
}

/** 
 * this returns will be used as the parameter of `t.tSTypeAnnotation()`
 * @param {import("./types.js").SchemaProperty} property
 * @returns {import("@babel/types").TSType}
 */
export function getPropertyType(property) {
    const tsType = mapPropertyType(property)
    if (tsType === "Array") {
        // @ts-ignore
        return t.tSArrayType(getPropertyType(property.items))
    } else if (tsType === "boolean") {
        return t.tSBooleanKeyword()
    } else if (tsType === "number") {
        return t.tSNumberKeyword()
    } else if (tsType === "object") {
        return getPropertyObjectType(property)
    } else if (tsType === "string") {
        return t.tSStringKeyword()
    } else if (tsType === "unknown") {
        return t.tSUnknownKeyword()
    } else {
        // $ref type
        return t.tSTypeReference(t.identifier(tsType))
    }
}

/**
 * handle mixed object and this returns will be used as the parameter of `t.tSTypeAnnotation()`
 * @param {import("./types.js").SchemaProperty} objectProperty 
 * @returns {import("@babel/types").TSType}
 */
export function getPropertyObjectType(objectProperty) {
    if (objectProperty.properties) {
        // mixed object
        return t.tSTypeLiteral(mapPropertiesToDefinition(objectProperty.properties).map(generatePropertySignature))
    } else if (objectProperty.additionalProperties) {
        // IndexSignature;
        // handle it as an indexer {[prop: string]: type;};
        const parameter = t.identifier("prop")
        parameter.typeAnnotation = t.tSTypeAnnotation(t.tSStringKeyword())
        const indexedPropType = getPropertyType(objectProperty.additionalProperties)
        return t.tSTypeLiteral([t.tSIndexSignature([parameter], t.tSTypeAnnotation(indexedPropType))])
    } else {
        // fallback to tSAnyKeyword
        return t.tSAnyKeyword()
    }
}

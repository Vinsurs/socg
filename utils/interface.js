// @ts-check
import * as t from "@babel/types"
import { addComment, mapPropertyType } from "./helper.js"

/**
 * @param {string} interfaceName
 * @param {import("./types.js").Schemas} properties
 * @param {import("@babel/types").TypeParameterDeclaration | null} [typeParameters]
 * @returns {import("@babel/types").InterfaceDeclaration}
 */
export function generateInterfaceDeclaration(interfaceName, properties, typeParameters = null) {
    const id = t.identifier(interfaceName)
    const body = generateObjectTypeAnnotation(mapPropertiesToDefinition(properties))
    return t.interfaceDeclaration(id, typeParameters, null, body)
}

/**
 * @param {Array<import("./types.js").ProcessedPropertyDefinition>} propertyDefinitions
 * @returns {import("@babel/types").ObjectTypeAnnotation}
 */
export function generateObjectTypeAnnotation(propertyDefinitions) {
    const properties = propertyDefinitions.map(generateObjectTypeProperty)
    return t.objectTypeAnnotation(properties)
}

/**
 * @param {import("./types.js").ProcessedPropertyDefinition} propertyDefinition
 * @returns {import("@babel/types").ObjectTypeProperty}
 */
export function generateObjectTypeProperty({ key, type, optional, comment }) {
    const id = t.identifier((comment ? "\n\t" : "") + key)
    // @ts-ignore
    const node = t.objectTypeProperty(id, type.node, null)
    node.optional = optional
    addComment(node, comment)
    return node
}

/**
 * @param {import("./types.js").Schemas} properties 
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
            kind: "js",
            node: getPropertyType(property)
        },
        optional: property.nullable,
        comment: property.description
    }
}

/** 
 * @param {import("./types.js").SchemaProperty} property
 * @returns {import("@babel/types").FlowType}
 */
export function getPropertyType(property) {
    const tsType = mapPropertyType(property)
    if (tsType === "Array") {
        return t.arrayTypeAnnotation(getPropertyType(property.items))
    } else if (tsType === "boolean") {
        return t.booleanTypeAnnotation()
    } else if (tsType === "number") {
        return t.numberTypeAnnotation()
    } else if (tsType === "object") {
        return getPropertyObjectType(property)
    } else if (tsType === "string") {
        return t.stringTypeAnnotation()
    } else {
        return t.genericTypeAnnotation(t.identifier(tsType))
    }
}

/**
 * @param {import("./types.js").SchemaProperty} objectProperty 
 * @returns {import("@babel/types").ObjectTypeAnnotation | import("@babel/types").AnyTypeAnnotation}
 */
export function getPropertyObjectType(objectProperty) {
    if (objectProperty.properties) {
        return generateObjectTypeAnnotation(mapPropertiesToDefinition(objectProperty.properties))
    } else if (objectProperty.additionalProperties) {
        // handle it as an indexer {[prop: string]: type;};
        const indexers = [
            t.objectTypeIndexer(t.identifier("prop"), t.stringTypeAnnotation(), getPropertyType(objectProperty.additionalProperties))
        ]
        return t.objectTypeAnnotation([], indexers)
    } else {
        // fallback to AnyTypeAnnotation
        return t.anyTypeAnnotation()
    }
}

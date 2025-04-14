// @ts-check
import * as t from "@babel/types"
import { normalizeId } from "./helper.js"

/**
 * @param {import("./types.js").SchemaProperty} property 
 */
export function isEnumProperty(property) {
    return property.enum && !property.properties
}

/**
 * @param {string} enumName
 * @param {import("./types.js").SchemaProperty["enum"]} enums
 * @param {import("./types.js").Config['customEnumMember']} [customEnumMember]
 * @returns {import("@babel/types").TSEnumDeclaration}
 */
export function generateEnumDeclaration(enumName, enums, customEnumMember) {
    enumName = normalizeId(enumName)
    const enumDefinitions = mapEnumDefinition(enums, customEnumMember)
    return t.tSEnumDeclaration(t.identifier(enumName), enumDefinitions.map(generateEnumMember))
}

/**
 * @param {import("./types.js").SchemaProperty["enum"]} enums 
 * @param {import("./types.js").Config['customEnumMember']} [customEnumMember]
 * @returns {Array<import("./types.js").ProcessedEnumDefinition>}
 */
export function mapEnumDefinition(enums, customEnumMember) {
    if (!enums) return []
    const customEnumKey = typeof customEnumMember === 'function'
    return enums.map((value, index) => {
        let name = `Enum_${index}`
        if (customEnumKey) {
            const custom = customEnumMember(value)
            if (typeof custom === 'object') {
                name = custom.name
                value = custom.initializer
            }
        }
        return {
            value,
            name
        }
    })
}

/**
 * @param {import("./types.js").ProcessedEnumDefinition} enumDefinition 
 * @returns {import("@babel/types").TSEnumMember}
 */
export function generateEnumMember({ name, value }) {
    return t.tSEnumMember(t.identifier(name), matchEnumMemberInitializer(value))
}

/** 
 * @param {import("./types.js").EnumValue} value  
 * @returns {import("@babel/types").Literal}
 */
export function matchEnumMemberInitializer(value) {
    if (typeof value === "string") return t.stringLiteral(value)
    else if (typeof value === "number") return t.numericLiteral(value)
    else if (typeof value === "boolean") return t.booleanLiteral(value)
    // fallback to nullLiteral if value type does not match EnumValue
    else return t.nullLiteral()
}
/**
 * @param {string} type 
 * @returns 
 */
export function isBuitinType(type) {
    return ["Array", "string", "number", "boolean", "null", "object", "unknown"].includes(type)
}
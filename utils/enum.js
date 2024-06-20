// @ts-check
import * as t from "@babel/types"

/**
 * @param {import("./types.js").SchemaProperty} property 
 */
export function isEnumProperty(property) {
    return property.enum && !property.properties
}

/**
 * @param {string} enumName
 * @param {import("./types.js").SchemaProperty["enum"]} enums
 * @returns {import("@babel/types").TSEnumDeclaration}
 */
export function generateEnumDeclaration(enumName, enums) {
    const enumDefinitions = mapEnumDefinition(enums)
    return t.tSEnumDeclaration(t.identifier(enumName), enumDefinitions.map(generateEnumMember))
}

/**
 * @param {import("./types.js").SchemaProperty["enum"]} enums 
 * @returns {Array<import("./types.js").ProcessedEnumDefinition>}
 */
export function mapEnumDefinition(enums) {
    return enums.map((value, index) => {
        return {
            value,
            name: `Enum_${index}`
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
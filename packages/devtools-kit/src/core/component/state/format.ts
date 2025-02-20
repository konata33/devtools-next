import { InspectorCustomState, InspectorState, customTypeEnums } from '../types'
import { INFINITY, NAN, NEGATIVE_INFINITY, UNDEFINED, rawTypeRE, specialTypeRE } from './constants'
import { isPlainObject } from './is'
import { escape, internalStateTokenToString, replaceStringToToken, replaceTokenToString } from './util'
import { reviver } from './reviver'

export function getInspectorStateValueType(value, raw = true) {
  const type = typeof value
  if (value == null || value === UNDEFINED) {
    return 'null'
  }
  else if (
    type === 'boolean'
      || type === 'number'
      || value === INFINITY
      || value === NEGATIVE_INFINITY
      || value === NAN
  ) {
    return 'literal'
  }
  else if (value?._custom) {
    if ((raw || value._custom.display != null || value._custom.displayText != null))
      return 'custom'

    else
      return getInspectorStateValueType(value._custom.value)
  }
  else if (typeof value === 'string') {
    const typeMatch = specialTypeRE.exec(value)
    if (typeMatch) {
      const [, type] = typeMatch
      return `native ${type}`
    }
    else {
      return 'string'
    }
  }
  else if (Array.isArray(value) || (value?._isArray)) {
    return 'array'
  }
  else if (isPlainObject(value)) {
    return 'plain-object'
  }
  else {
    return 'unknown'
  }
}

export function formatInspectorStateValue(value, quotes = false) {
  let result
  const type = getInspectorStateValueType(value, false)
  if (type !== 'custom' && value?._custom)
    value = value._custom.value

  // eslint-disable-next-line no-cond-assign
  if ((result = internalStateTokenToString(value))) {
    return result
  }
  else if (type === 'custom') {
    // For digging out nested custom name.
    const nestedName = value._custom.value?._custom && formatInspectorStateValue(value._custom.value)
    return nestedName || value._custom.displayText || value._custom.display
  }
  else if (type === 'array') {
    return `Array[${value.length}]`
  }
  else if (type === 'plain-object') {
    return `Object${Object.keys(value).length ? '' : ' (empty)'}`
  }
  else if (type?.includes('native')) {
    return escape(specialTypeRE.exec(value as string)?.[2] as string)
  }
  else if (typeof value === 'string') {
    const typeMatch = value.match(rawTypeRE)
    if (typeMatch)
      value = escape(typeMatch[1])

    else if (quotes)
      value = `<span>"</span>${escape(value)}<span>"</span>`

    else
      value = escape(value)

    value = value.replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<span>\\n</span>')
  }
  return value
}

export function getRaw(value: InspectorState['value']): {
  value: object | string | number | boolean | null
  inherit: {} | { abstract: true }
  customType?: customTypeEnums
} {
  let customType: customTypeEnums
  const isCustom = getInspectorStateValueType(value) === 'custom'
  let inherit = {}
  if (isCustom) {
    const data = value as InspectorCustomState
    const customValue = data._custom?.value
    const currentCustomType = data._custom?.type
    const nestedCustom = typeof customValue === 'object' && customValue !== null && '_custom' in customValue
      ? getRaw(customValue)
      : { inherit: undefined, value: undefined, customType: undefined }
    inherit = nestedCustom.inherit || data._custom?.fields || {}
    value = nestedCustom.value || customValue as string
    customType = nestedCustom.customType || currentCustomType as customTypeEnums
  }
  // @ts-expect-error @TODO: type
  if (value && value._isArray)
    // @ts-expect-error @TODO: type
    value = value.items

  // @ts-expect-error customType map be assigned as undefined.
  return { value, inherit, customType }
}

export function toEdit(value: unknown, customType?: customTypeEnums) {
  if (customType === 'bigint')
    return value as string

  return replaceTokenToString(JSON.stringify(value))
}

export function toSubmit(value: string, customType?: customTypeEnums) {
  if (customType === 'bigint')
    return BigInt(value)

  return JSON.parse(replaceStringToToken(value), reviver)
}

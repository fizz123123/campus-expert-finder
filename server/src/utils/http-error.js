export class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

export function readOptionalQuery(query, name, maxLength = 100) {
  const value = query[name]

  if (value === undefined) return null

  if (typeof value !== 'string') {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} 必須是單一文字`)
  }

  const normalizedValue = value.trim()

  if (normalizedValue.length > maxLength) {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} 不可超過 ${maxLength} 個字元`)
  }

  return normalizedValue || null
}

export function readPositiveInteger(value, name = 'id') {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} 必須是正整數`)
  }

  const number = Number(value)

  if (!Number.isSafeInteger(number)) {
    throw new HttpError(400, 'INVALID_PARAMETER', `${name} 必須是有效的正整數`)
  }

  return number
}

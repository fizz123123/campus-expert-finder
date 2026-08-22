const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(path) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`)
  } catch {
    throw new ApiError('目前無法連線到伺服器，請確認後端是否已啟動。', 0, 'NETWORK_ERROR')
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new ApiError('伺服器回傳了無法讀取的資料。', response.status, 'INVALID_RESPONSE')
  }

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? '請求失敗，請稍後再試。',
      response.status,
      payload.error?.code ?? 'REQUEST_FAILED',
    )
  }

  return payload
}

export function getTeachers(filters = {}) {
  const searchParams = new URLSearchParams()

  for (const [name, value] of Object.entries(filters)) {
    if (value) searchParams.set(name, value)
  }

  const queryString = searchParams.toString()
  return request(`/teachers${queryString ? `?${queryString}` : ''}`)
}

export function getTeacher(id) {
  return request(`/teachers/${encodeURIComponent(id)}`)
}

export function getDepartments() {
  return request('/meta/departments')
}

export function getExpertiseOptions() {
  return request('/meta/expertise')
}

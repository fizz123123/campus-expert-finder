import assert from 'node:assert/strict'
import app from './app.js'

const server = app.listen(0, '127.0.0.1')

await new Promise((resolve, reject) => {
  server.once('listening', resolve)
  server.once('error', reject)
})

const address = server.address()
assert.ok(address && typeof address !== 'string')
const baseUrl = `http://127.0.0.1:${address.port}`

async function request(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`)
  assert.equal(response.status, expectedStatus, `${path} 應回傳 HTTP ${expectedStatus}`)
  assert.match(response.headers.get('content-type') ?? '', /^application\/json/)
  return response.json()
}

try {
  const health = await request('/api/health')
  assert.deepEqual(health.data, { status: 'ok', database: 'connected' })

  const allTeachers = await request('/api/teachers')
  assert.equal(allTeachers.data.length, 24)
  assert.equal(allTeachers.meta.count, 24)
  assert.deepEqual(allTeachers.meta.filters, {
    q: null,
    department: null,
    expertise: null,
  })
  assert.equal(new Set(allTeachers.data.map((teacher) => teacher.id)).size, 24)
  assert.ok(allTeachers.data.every((teacher) => !('bio' in teacher)))

  const byKeyword = await request(`/api/teachers?q=${encodeURIComponent('人工智慧')}`)
  assert.ok(byKeyword.meta.count >= 2)

  const byName = await request(`/api/teachers?q=${encodeURIComponent('林映辰')}`)
  assert.equal(byName.meta.count, 1)
  assert.equal(byName.data[0].name, '林映辰')

  const byCourse = await request(`/api/teachers?q=${encodeURIComponent('資訊安全概論')}`)
  assert.equal(byCourse.meta.count, 1)
  assert.equal(byCourse.data[0].name, '黃思妤')

  const byDepartment = await request(
    `/api/teachers?department=${encodeURIComponent('資訊工程學系')}`,
  )
  assert.equal(byDepartment.meta.count, 6)
  assert.ok(byDepartment.data.every((teacher) => teacher.department === '資訊工程學系'))

  const byExpertise = await request(`/api/teachers?expertise=${encodeURIComponent('機器學習')}`)
  assert.equal(byExpertise.meta.count, 2)
  assert.ok(byExpertise.data.every((teacher) => teacher.expertise.includes('機器學習')))

  const combined = await request(
    `/api/teachers?q=${encodeURIComponent('人工智慧')}&department=${encodeURIComponent('資訊工程學系')}`,
  )
  assert.equal(combined.meta.count, 1)
  assert.equal(combined.data[0].name, '林映辰')

  const empty = await request(`/api/teachers?q=${encodeURIComponent('不存在的研究領域')}`)
  assert.deepEqual(empty.data, [])
  assert.equal(empty.meta.count, 0)

  const detail = await request('/api/teachers/1')
  assert.equal(detail.data.id, 1)
  assert.equal(detail.data.name, '林映辰')
  assert.ok(detail.data.bio.length >= 60)
  assert.ok(detail.data.expertise.length >= 2)
  assert.ok(detail.data.courses.length >= 1)

  const departments = await request('/api/meta/departments')
  assert.equal(departments.data.length, 4)
  assert.ok(departments.data.every((department) => department.teacherCount === 6))

  const expertise = await request('/api/meta/expertise')
  assert.ok(expertise.data.some((item) => item.name === '人工智慧'))
  for (let index = 1; index < expertise.data.length; index += 1) {
    assert.ok(expertise.data[index - 1].teacherCount >= expertise.data[index].teacherCount)
  }

  const invalidId = await request('/api/teachers/0', 400)
  assert.equal(invalidId.error.code, 'INVALID_PARAMETER')

  const invalidTextId = await request('/api/teachers/not-a-number', 400)
  assert.equal(invalidTextId.error.code, 'INVALID_PARAMETER')

  const missingTeacher = await request('/api/teachers/9999', 404)
  assert.equal(missingTeacher.error.code, 'TEACHER_NOT_FOUND')

  const longQuery = new URLSearchParams({ q: 'a'.repeat(101) })
  const invalidQuery = await request(`/api/teachers?${longQuery}`, 400)
  assert.equal(invalidQuery.error.code, 'INVALID_PARAMETER')

  const repeatedQuery = await request('/api/teachers?q=AI&q=ML', 400)
  assert.equal(repeatedQuery.error.code, 'INVALID_PARAMETER')

  const unknownRoute = await request('/api/does-not-exist', 404)
  assert.equal(unknownRoute.error.code, 'ROUTE_NOT_FOUND')

  console.log('API smoke test passed: 18 scenarios')
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}

import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'campus-expert-azure-'))
const databaseFile = join(temporaryDirectory, 'campus-expert-finder.sqlite')
const clientOrigin = 'https://campus-expert-test.azurestaticapps.net'

process.env.DB_FILE = databaseFile
process.env.CLIENT_ORIGIN = clientOrigin
process.env.WEBSITE_SITE_NAME = 'campus-expert-test'

const { default: app } = await import('./app.js')
const { default: database } = await import('./db/connection.js')
const server = app.listen(0, '127.0.0.1')

await new Promise((resolve, reject) => {
  server.once('listening', resolve)
  server.once('error', reject)
})

const address = server.address()
assert.ok(address && typeof address !== 'string')
const baseUrl = `http://127.0.0.1:${address.port}`

try {
  assert.ok(existsSync(databaseFile), 'Azure 啟動時應自動建立暫存 SQLite')

  const healthResponse = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: clientOrigin },
  })
  assert.equal(healthResponse.status, 200)
  assert.equal(healthResponse.headers.get('access-control-allow-origin'), clientOrigin)

  const teachersResponse = await fetch(`${baseUrl}/api/teachers`)
  assert.equal(teachersResponse.status, 200)
  const teachersPayload = await teachersResponse.json()
  assert.equal(teachersPayload.meta.count, 24)

  console.log('Azure startup smoke test passed: SQLite initialized and API returned 24 teachers')
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  database.close()
  rmSync(temporaryDirectory, { recursive: true, force: true })
}

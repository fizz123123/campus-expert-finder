import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const defaultDatabaseFile = process.env.WEBSITE_SITE_NAME
  ? '/tmp/campus-expert-finder.sqlite'
  : './data/campus-expert-finder.sqlite'
const databasePath = resolve(process.cwd(), process.env.DB_FILE ?? defaultDatabaseFile)

mkdirSync(dirname(databasePath), { recursive: true })

const database = new Database(databasePath)
database.pragma('foreign_keys = ON')

export default database

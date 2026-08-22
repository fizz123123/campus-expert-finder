import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const databasePath = resolve(process.cwd(), process.env.DB_FILE ?? './data/campus-expert-finder.sqlite')

mkdirSync(dirname(databasePath), { recursive: true })

const database = new Database(databasePath)
database.pragma('foreign_keys = ON')

export default database


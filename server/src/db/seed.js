import 'dotenv/config'
import database from './connection.js'
import { seedDatabase } from './setup.js'

try {
  const counts = seedDatabase()
  console.log('SQLite seed completed:', counts)
} finally {
  database.close()
}

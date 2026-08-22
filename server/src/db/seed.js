import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import database from './connection.js'
import { teachers } from './seed-data.js'

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
const schema = readFileSync(schemaPath, 'utf8')

database.exec(schema)

const insertTeacher = database.prepare(`
  INSERT INTO teachers (name, title, department, email, office, bio, avatar_color)
  VALUES (@name, @title, @department, @email, @office, @bio, @avatarColor)
`)
const insertExpertise = database.prepare('INSERT INTO expertise (teacher_id, name) VALUES (?, ?)')
const insertCourse = database.prepare('INSERT INTO courses (teacher_id, name) VALUES (?, ?)')

const seedDatabase = database.transaction(() => {
  database.prepare('DELETE FROM courses').run()
  database.prepare('DELETE FROM expertise').run()
  database.prepare('DELETE FROM teachers').run()
  database
    .prepare("DELETE FROM sqlite_sequence WHERE name IN ('teachers', 'expertise', 'courses')")
    .run()

  for (const teacher of teachers) {
    const result = insertTeacher.run(teacher)
    const teacherId = Number(result.lastInsertRowid)

    for (const expertise of teacher.expertise) {
      insertExpertise.run(teacherId, expertise)
    }

    for (const course of teacher.courses) {
      insertCourse.run(teacherId, course)
    }
  }
})

try {
  seedDatabase()

  const counts = {
    teachers: database.prepare('SELECT COUNT(*) AS count FROM teachers').get().count,
    expertise: database.prepare('SELECT COUNT(*) AS count FROM expertise').get().count,
    courses: database.prepare('SELECT COUNT(*) AS count FROM courses').get().count,
  }

  console.log('SQLite seed completed:', counts)
} finally {
  database.close()
}

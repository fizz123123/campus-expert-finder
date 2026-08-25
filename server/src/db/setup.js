import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import database from './connection.js'
import { teachers } from './seed-data.js'

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
const schema = readFileSync(schemaPath, 'utf8')

const expectedCounts = {
  teachers: teachers.length,
  expertise: teachers.reduce((total, teacher) => total + teacher.expertise.length, 0),
  courses: teachers.reduce((total, teacher) => total + teacher.courses.length, 0),
}

export function getDatabaseCounts() {
  return {
    teachers: database.prepare('SELECT COUNT(*) AS count FROM teachers').get().count,
    expertise: database.prepare('SELECT COUNT(*) AS count FROM expertise').get().count,
    courses: database.prepare('SELECT COUNT(*) AS count FROM courses').get().count,
  }
}

const rebuildDatabase = database.transaction(() => {
  database.prepare('DELETE FROM courses').run()
  database.prepare('DELETE FROM expertise').run()
  database.prepare('DELETE FROM teachers').run()
  database
    .prepare("DELETE FROM sqlite_sequence WHERE name IN ('teachers', 'expertise', 'courses')")
    .run()

  const insertTeacher = database.prepare(`
    INSERT INTO teachers (name, title, department, email, office, bio, avatar_color)
    VALUES (@name, @title, @department, @email, @office, @bio, @avatarColor)
  `)
  const insertExpertise = database.prepare('INSERT INTO expertise (teacher_id, name) VALUES (?, ?)')
  const insertCourse = database.prepare('INSERT INTO courses (teacher_id, name) VALUES (?, ?)')

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

export function seedDatabase() {
  database.exec(schema)
  rebuildDatabase()
  return getDatabaseCounts()
}

export function ensureDatabaseReady() {
  database.exec(schema)
  const counts = getDatabaseCounts()
  const needsSeed = Object.entries(expectedCounts).some(
    ([table, expectedCount]) => counts[table] !== expectedCount,
  )

  if (!needsSeed) return { seeded: false, counts }

  return {
    seeded: true,
    counts: seedDatabase(),
  }
}

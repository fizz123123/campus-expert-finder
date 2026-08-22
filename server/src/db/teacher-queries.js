import database from './connection.js'

function getExpertise(teacherId) {
  return database
    .prepare('SELECT name FROM expertise WHERE teacher_id = ? ORDER BY name')
    .all(teacherId)
    .map((row) => row.name)
}

function getCourses(teacherId) {
  return database
    .prepare('SELECT name FROM courses WHERE teacher_id = ? ORDER BY name')
    .all(teacherId)
    .map((row) => row.name)
}

function addRelations(teacher) {
  return {
    ...teacher,
    expertise: getExpertise(teacher.id),
    courses: getCourses(teacher.id),
  }
}

export function findTeachers({ q, department, expertise }) {
  const conditions = []
  const parameters = {}

  if (q) {
    conditions.push(`
      (
        teachers.name LIKE @q
        OR teachers.title LIKE @q
        OR teachers.department LIKE @q
        OR EXISTS (
          SELECT 1
          FROM expertise AS search_expertise
          WHERE search_expertise.teacher_id = teachers.id
            AND search_expertise.name LIKE @q
        )
        OR EXISTS (
          SELECT 1
          FROM courses AS search_courses
          WHERE search_courses.teacher_id = teachers.id
            AND search_courses.name LIKE @q
        )
      )
    `)
    parameters.q = `%${q}%`
  }

  if (department) {
    conditions.push('teachers.department = @department')
    parameters.department = department
  }

  if (expertise) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM expertise AS filter_expertise
        WHERE filter_expertise.teacher_id = teachers.id
          AND filter_expertise.name = @expertise
      )
    `)
    parameters.expertise = expertise
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const teachers = database
    .prepare(
      `
      SELECT
        id,
        name,
        title,
        department,
        email,
        office,
        avatar_color AS avatarColor
      FROM teachers
      ${whereClause}
      ORDER BY name ASC
    `,
    )
    .all(parameters)

  return teachers.map(addRelations)
}

export function findTeacherById(id) {
  const teacher = database
    .prepare(
      `
      SELECT
        id,
        name,
        title,
        department,
        email,
        office,
        bio,
        avatar_color AS avatarColor
      FROM teachers
      WHERE id = ?
    `,
    )
    .get(id)

  return teacher ? addRelations(teacher) : null
}

export function findDepartments() {
  return database
    .prepare(
      `
      SELECT department AS name, COUNT(*) AS teacherCount
      FROM teachers
      GROUP BY department
      ORDER BY department ASC
    `,
    )
    .all()
}

export function findExpertiseOptions() {
  return database
    .prepare(
      `
      SELECT name, COUNT(DISTINCT teacher_id) AS teacherCount
      FROM expertise
      GROUP BY name
      ORDER BY teacherCount DESC, name ASC
    `,
    )
    .all()
}

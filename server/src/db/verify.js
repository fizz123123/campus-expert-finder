import 'dotenv/config'
import assert from 'node:assert/strict'
import database from './connection.js'

const requiredExpertise = [
  '人工智慧',
  '機器學習',
  '資料庫',
  '資訊安全',
  '網路',
  '軟體工程',
  '人機互動',
  '雲端運算',
]

function hasUniqueIndex(table, expectedColumns) {
  return database.pragma(`index_list('${table}')`).some((index) => {
    if (index.unique !== 1) return false

    const columns = database
      .pragma(`index_info('${index.name}')`)
      .sort((left, right) => left.seqno - right.seqno)
      .map((column) => column.name)

    return columns.join(',') === expectedColumns.join(',')
  })
}

try {
  const counts = {
    teachers: database.prepare('SELECT COUNT(*) AS count FROM teachers').get().count,
    expertise: database.prepare('SELECT COUNT(*) AS count FROM expertise').get().count,
    courses: database.prepare('SELECT COUNT(*) AS count FROM courses').get().count,
  }

  assert.equal(counts.teachers, 24, '教師資料必須剛好有 24 筆')

  const departments = database
    .prepare(
      `
      SELECT department AS name, COUNT(*) AS teacherCount
      FROM teachers
      GROUP BY department
      ORDER BY department
    `,
    )
    .all()

  assert.ok(departments.length >= 4, '至少需要 4 個系所')
  assert.ok(
    departments.every((department) => department.teacherCount >= 5),
    '每個系所至少需要 5 位教師',
  )

  const teacherRelations = database
    .prepare(
      `
      SELECT
        teachers.id,
        teachers.bio,
        teachers.email,
        COUNT(DISTINCT expertise.id) AS expertiseCount,
        COUNT(DISTINCT courses.id) AS courseCount
      FROM teachers
      LEFT JOIN expertise ON expertise.teacher_id = teachers.id
      LEFT JOIN courses ON courses.teacher_id = teachers.id
      GROUP BY teachers.id
    `,
    )
    .all()

  assert.ok(
    teacherRelations.every((teacher) => teacher.expertiseCount >= 2 && teacher.expertiseCount <= 4),
    '每位教師必須有 2 至 4 個專長',
  )
  assert.ok(
    teacherRelations.every((teacher) => teacher.courseCount >= 1 && teacher.courseCount <= 3),
    '每位教師必須有 1 至 3 門課程',
  )
  assert.ok(
    teacherRelations.every((teacher) => teacher.bio.length >= 60 && teacher.bio.length <= 120),
    '每位教師簡介必須介於 60 至 120 字',
  )
  assert.ok(
    teacherRelations.every((teacher) => teacher.email.endsWith('@example.edu')),
    '所有模擬信箱必須使用 example.edu',
  )

  const availableExpertise = new Set(
    database
      .prepare('SELECT DISTINCT name FROM expertise')
      .all()
      .map((row) => row.name),
  )
  assert.ok(
    requiredExpertise.every((name) => availableExpertise.has(name)),
    '缺少規格要求的熱門研究領域',
  )

  const foreignKeyErrors = database.pragma('foreign_key_check')
  assert.equal(foreignKeyErrors.length, 0, '資料庫存在無效外鍵')

  const duplicateExpertise = database
    .prepare(
      `
      SELECT teacher_id, name, COUNT(*) AS count
      FROM expertise
      GROUP BY teacher_id, name
      HAVING COUNT(*) > 1
    `,
    )
    .all()
  const duplicateCourses = database
    .prepare(
      `
      SELECT teacher_id, name, COUNT(*) AS count
      FROM courses
      GROUP BY teacher_id, name
      HAVING COUNT(*) > 1
    `,
    )
    .all()

  assert.equal(duplicateExpertise.length, 0, '存在重複的教師專長')
  assert.equal(duplicateCourses.length, 0, '存在重複的教師課程')
  assert.ok(hasUniqueIndex('teachers', ['email']), 'teachers.email 必須是唯一值')
  assert.ok(hasUniqueIndex('expertise', ['teacher_id', 'name']), '同一位教師不可有重複專長')
  assert.ok(hasUniqueIndex('courses', ['teacher_id', 'name']), '同一位教師不可有重複課程')

  for (const table of ['expertise', 'courses']) {
    const foreignKeys = database.pragma(`foreign_key_list('${table}')`)
    assert.ok(
      foreignKeys.some(
        (foreignKey) =>
          foreignKey.table === 'teachers' && foreignKey.on_delete.toUpperCase() === 'CASCADE',
      ),
      `${table}.teacher_id 必須以 CASCADE 連結 teachers`,
    )
  }

  console.log(
    JSON.stringify(
      {
        status: 'ok',
        counts,
        departments,
        foreignKeyErrors: foreignKeyErrors.length,
      },
      null,
      2,
    ),
  )
} finally {
  database.close()
}

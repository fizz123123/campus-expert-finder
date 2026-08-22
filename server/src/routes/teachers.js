import { Router } from 'express'
import { findTeacherById, findTeachers } from '../db/teacher-queries.js'
import { HttpError, readOptionalQuery, readPositiveInteger } from '../utils/http-error.js'

const router = Router()

router.get('/', (request, response) => {
  const filters = {
    q: readOptionalQuery(request.query, 'q'),
    department: readOptionalQuery(request.query, 'department'),
    expertise: readOptionalQuery(request.query, 'expertise'),
  }
  const teachers = findTeachers(filters)

  response.json({
    data: teachers,
    meta: {
      count: teachers.length,
      filters,
    },
  })
})

router.get('/:id', (request, response) => {
  const id = readPositiveInteger(request.params.id)
  const teacher = findTeacherById(id)

  if (!teacher) {
    throw new HttpError(404, 'TEACHER_NOT_FOUND', '找不到指定的教師')
  }

  response.json({ data: teacher })
})

export default router

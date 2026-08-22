import { Router } from 'express'
import { findDepartments, findExpertiseOptions } from '../db/teacher-queries.js'

const router = Router()

router.get('/departments', (_request, response) => {
  response.json({ data: findDepartments() })
})

router.get('/expertise', (_request, response) => {
  response.json({ data: findExpertiseOptions() })
})

export default router

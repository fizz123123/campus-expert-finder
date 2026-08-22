import cors from 'cors'
import express from 'express'
import database from './db/connection.js'
import metaRouter from './routes/meta.js'
import teachersRouter from './routes/teachers.js'
import { HttpError } from './utils/http-error.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (_request, response, next) => {
  try {
    database.prepare('SELECT 1').get()
    response.json({
      data: {
        status: 'ok',
        database: 'connected',
      },
    })
  } catch (error) {
    next(error)
  }
})

app.use('/api/teachers', teachersRouter)
app.use('/api/meta', metaRouter)

app.use('/api', (_request, response) => {
  response.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: '找不到要求的 API 路徑',
    },
  })
})

app.use((error, _request, response, _next) => {
  if (error instanceof HttpError) {
    return response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    })
  }

  console.error(error)
  return response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '伺服器發生未預期的錯誤',
    },
  })
})

export default app

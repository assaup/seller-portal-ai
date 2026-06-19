import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { existsSync } from 'fs'
import { initDB } from './db'
import itemsRouter from './routes/items'
import aiRouter from './routes/ai'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

app.use('/api/items', itemsRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// В продакшене сервер раздаёт собранный клиент с того же origin
const clientDir = path.join(__dirname, 'public')
if (existsSync(clientDir)) {
  app.use(express.static(clientDir))
  // SPA fallback: всё, что не /api, отдаёт index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'))
  })
}

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('DB init failed', err)
    process.exit(1)
  })

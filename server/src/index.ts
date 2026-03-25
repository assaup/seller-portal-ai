import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import path from 'path'
import type { DB } from './types'
import itemsRouter from './routes/items'

const app = express()
const PORT = process.env.PORT ?? 8080

app.use(cors())
app.use(express.json())

export function getDB(): DB {
    const raw = readFileSync(path.join(__dirname, 'db.json'), 'utf-8')
    return JSON.parse(raw)
}

app.use('/items', itemsRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
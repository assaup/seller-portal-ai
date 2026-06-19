import { Router } from 'express'
import { pool, SELECT_COLS } from '../db'
import { checkNeedsRevision } from '../utils/needsRevision'
import type { Item, Category } from '../types'

const router = Router()
const VALID_CATEGORIES: Category[] = ['auto', 'real_estate', 'electronics']

function validateUpdateBody(body: unknown): body is Omit<Item, 'id' | 'createdAt' | 'imageUrl'> {
    if (!body || typeof body !== 'object') return false
    const b = body as Record<string, unknown>
    if (!VALID_CATEGORIES.includes(b.category as Category)) return false
    if (typeof b.title !== 'string' || b.title.trim() === '') return false
    if (typeof b.price !== 'number' || b.price <= 0) return false
    if (b.description !== undefined && typeof b.description !== 'string') return false
    if (!b.params || typeof b.params !== 'object') return false
    return true
}

// Строка из БД -> клиентский Item (created_at приходит как Date)
type Row = Omit<Item, 'createdAt'> & { createdAt: Date | string }

function toItem(row: Row): Item {
    return {
        ...row,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    }
}

router.get('/', async (req, res) => {
    const conditions: string[] = []
    const values: unknown[] = []

    // Поиск по названию
    const q = req.query.q as string | undefined
    if (q) {
        values.push(`%${q}%`)
        conditions.push(`title ILIKE $${values.length}`)
    }

    // Фильтр по категориям
    const categories = req.query.categories as string | undefined
    if (categories) {
        values.push(categories.split(','))
        conditions.push(`category = ANY($${values.length})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Сортировка (whitelist колонок и направления)
    const sortColumn =
        req.query.sortColumn === 'title' ? 'title'
        : req.query.sortColumn === 'createdAt' ? 'created_at'
        : null
    const sortDirection = req.query.sortDirection === 'desc' ? 'DESC' : 'ASC'
    const orderBy = sortColumn ? `ORDER BY ${sortColumn} ${sortDirection}` : ''

    try {
        const { rows } = await pool.query<Row>(
            `SELECT ${SELECT_COLS} FROM items ${where} ${orderBy}`,
            values
        )
        let items = rows.map(toItem)

        // Фильтр needsRevision вычисляется в коде (зависит от заполненности params)
        const needsRevision = req.query.needsRevision as string | undefined
        if (needsRevision === 'true') {
            items = items.filter(checkNeedsRevision)
        }

        // Пагинация
        const skip = parseInt(req.query.skip as string) || 0
        const limit = parseInt(req.query.limit as string) || 10

        const total = items.length
        const paginated = items.slice(skip, skip + limit)

        res.json({
            items: paginated.map((item) => ({
                id: item.id,
                category: item.category,
                title: item.title,
                price: item.price,
                imageUrl: item.imageUrl,
                needsRevision: checkNeedsRevision(item),
            })),
            total,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Database error' })
    }
})

// GET /items/:id
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query<Row>(
            `SELECT ${SELECT_COLS} FROM items WHERE id = $1`,
            [req.params.id]
        )
        if (rows.length === 0) {
            res.status(404).json({ error: 'Item not found' })
            return
        }
        const item = toItem(rows[0])
        res.json({ ...item, needsRevision: checkNeedsRevision(item) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Database error' })
    }
})

router.put('/:id', async (req, res) => {
    if (!validateUpdateBody(req.body)) {
        res.status(400).json({ error: 'Invalid request body' })
        return
    }

    const { category, title, description, price, params } = req.body

    try {
        const { rows } = await pool.query<Row>(
            `UPDATE items
             SET category = $1, title = $2, description = $3, price = $4, params = $5
             WHERE id = $6
             RETURNING ${SELECT_COLS}`,
            [category, title, description ?? null, price, JSON.stringify(params), req.params.id]
        )
        if (rows.length === 0) {
            res.status(404).json({ error: 'Item not found' })
            return
        }
        const item = toItem(rows[0])
        res.json({ ...item, needsRevision: checkNeedsRevision(item) })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Database error' })
    }
})

export default router

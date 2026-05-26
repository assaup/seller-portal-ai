import { Router } from 'express'
import { writeFileSync } from 'fs'
import path from 'path'
import { getDB } from '../index'
import { checkNeedsRevision } from '../utils/needsRevision'
import type { Item, Category } from '../types'

const router = Router()
const DB_PATH = path.join(__dirname, '../db.json')
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

router.get('/', (req, res) => {
    const db = getDB()
    let items = db.items


    // Поиск по названию
    const q = req.query.q as string || undefined
    if (q) {
        items = items.filter((item) =>
            item.title.toLowerCase().includes(q.toLowerCase())
        )
    }


    // Фильтр по категориям 
    const categories = req.query.categories as string || undefined
    if (categories) {
        const list = categories.split(',')
        items = items.filter((item) => list.includes(item.category))
    }


    // Фильтр needsRevision
    const needsRevision = req.query.needsRevision as string || undefined
    if (needsRevision === 'true'){
        items = items.filter((item) => checkNeedsRevision(item))
    } 


    // Сортировка
    const sortColumn = req.query.sortColumn as 'title' | 'createdAt' | undefined
    const sortDirection = req.query.sortDirection as 'asc' | 'desc' | undefined

    if (sortColumn){
        items = items.sort((a, b) => {
            const aVal = a[sortColumn]
            const bVal = b[sortColumn]

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
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
})

// GET /items/:id
router.get('/:id', (req, res) => {
    const db = getDB()
    const item = db.items.find((i) => i.id === req.params.id)

    if (!item){
        res.status(404).json({error: 'Item not found'})
        return
    }

    res.json({
        ...item,
        needsRevision: checkNeedsRevision(item)
    })

})

router.put('/:id', (req, res) => {
    if (!validateUpdateBody(req.body)) {
        res.status(400).json({ error: 'Invalid request body' })
        return
    }

    const db = getDB()
    const index = db.items.findIndex((i) => i.id === req.params.id)

    if (index === -1){
        res.status(404).json({error: 'Item not found'})
        return
    }

    const { category, title, description, price, params } = req.body
    const updated: Item = {
        ...db.items[index],
        category,
        title,
        description,
        price,
        params,
        id: req.params.id,
    }

    db.items[index] = updated
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    res.json({
        ...updated,
        needsRevision: checkNeedsRevision(updated)
    })
})

export default router
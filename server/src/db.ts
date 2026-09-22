import { Pool } from 'pg'
import { readFileSync } from 'fs'
import path from 'path'
import type { DB } from './types'

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// Облачный Postgres (Neon) может закрывать простаивающие соединения —
// без обработчика такая ошибка idle-клиента роняет процесс
pool.on('error', (err) => {
    console.error('Postgres idle client error', err)
})

// Колонки для SELECT с приведением к форме клиентского Item (camelCase, price как number)
export const SELECT_COLS =
    `id, category, title, description, price::float8 AS price, ` +
    `image_url AS "imageUrl", params, created_at AS "createdAt"`

export async function initDB(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS items (
            id          TEXT PRIMARY KEY,
            category    TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT,
            price       NUMERIC NOT NULL,
            image_url   TEXT,
            params      JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `)
    await seedIfEmpty()
}

// Первичное наполнение из db.json — только если таблица пустая
async function seedIfEmpty(): Promise<void> {
    const { rows } = await pool.query<{ count: number }>(
        'SELECT COUNT(*)::int AS count FROM items'
    )
    if (rows[0].count > 0) return

    const raw = readFileSync(path.join(__dirname, 'db.json'), 'utf-8')
    const data = JSON.parse(raw) as DB

    for (const item of data.items) {
        await pool.query(
            `INSERT INTO items (id, category, title, description, price, image_url, params, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [
                item.id,
                item.category,
                item.title,
                item.description ?? null,
                item.price,
                item.imageUrl ?? null,
                JSON.stringify(item.params ?? {}),
                item.createdAt,
            ]
        )
    }
    console.log(`Seeded ${data.items.length} items`)
}

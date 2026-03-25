import type { Item } from '../types'

export function checkNeedsRevision(item: Item): boolean {
    if (!item.description) return true

    const params = item.params

    const values = Object.values(params)
    const filled = values.filter((v) => v !== undefined && v !== null && v !== '')

    return filled.length < Math.ceil(values.length / 2)
}

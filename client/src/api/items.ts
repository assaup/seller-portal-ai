import { httpClient } from "./client";
import type { Item, ItemsResponse, ItemUpdatePayload } from '../types'

export type GetItemsParams = {
    q?: string
    limit?: number
    skip?: number
    categories?: string[]
    needsRevision?: boolean
    sortColumn?: 'title' | 'createdAt'
    sortDirection?: 'asc' | 'desc'
    signal?: AbortSignal
}

export const itemsApi = {
    getAll: ({signal, categories, ...params}: GetItemsParams ={}): Promise<ItemsResponse> =>{
        const query = new URLSearchParams()

        if (params.q) query.set('q', params.q)
        if (params.limit) query.set('limit', String(params.limit))
        if (params.skip !== undefined) query.set('skip', String(params.skip))
        if (params.needsRevision) query.set('needsRevision', 'true')
        if (params.sortColumn) query.set('sortColumn', params.sortColumn)
        if (params.sortDirection) query.set('sortDirectoin', params.sortDirection)
        if (categories?.length) query.set('categories', categories.join(','))

        return httpClient.get<ItemsResponse>(`/api/items/${query.toString()}`, signal)
    },

    getById: (id: string, signal?: AbortSignal): Promise<Item> => 
        httpClient.get<Item>(`/api/items/${id}`, signal),

    update: (id: string, payload: ItemUpdatePayload): Promise<Item> =>
        httpClient.put<Item>(`/api/items/${id}`, payload)
}
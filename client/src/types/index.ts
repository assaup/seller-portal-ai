export type Category = 'auto' | 'real_estate' | 'electronics'

export type AutoParams = {
    brand?: string
    model?: string
    yearOfManufacture?: number
    transmission?: 'automatic' | 'manual'
    mileage?: number
    enginePower?: number
}

export type RealEstateParams = {
    type?: 'flat' | 'house' | 'room'
    address?: string
    area?: number
    floor?: number
}

export type ElectronicsParams = {
    type?: 'phone' | 'laptop' | 'misc'
    brand?: string
    model?: string
    condition?: 'new' | 'used'
    color?: string
}

export type Item = {
    id: string
    category: Category
    title: string
    description?: string
    price: number
    createdAt: string
    imageUrl?: string
    needsRevision: boolean
    params: AutoParams | RealEstateParams | ElectronicsParams
}

export type ItemListItem = {
    id: string
    category: Category
    title: string
    price: number
    imageUrl?: string
    needsRevision: boolean
}

export type ItemsResponse = {
    items: ItemListItem[]
    total: number
}

export type ItemUpdatePayload = {
    category: Category
    title: string
    description?: string
    price: number
    params: AutoParams | RealEstateParams | ElectronicsParams
}

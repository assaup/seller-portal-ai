import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [stored, setStored] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key)
            return item ? (JSON.parse(item) as T): initialValue
        } catch {
            return initialValue
        }
    })

    const setValue = (value: T) => {
        setStored(value)
        localStorage.setItem(key, JSON.stringify(value))
    }

    const removeValue = () => {
        setStored(initialValue)
        localStorage.removeItem(key)
    }

    return [stored, setValue, removeValue] as const
}
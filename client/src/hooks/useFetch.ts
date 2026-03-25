import { useState, useEffect } from 'react'

type State<T> = {
    data: T | null
    loading: boolean
    error: string | null
}

export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[] =[]) {
    const [state, setState] = useState<State<T>>({
        data: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        const controller = new AbortController()
        let canselled = false

        fetcher(controller.signal)
            .then((data) => {
                if (!canselled){
                    setState({data, loading: false, error: null})
                }
            })
            .catch((err) => {
                if (canselled || err.name === 'AbortError') return
                setState({data: null, loading: false, error: err.message})
            })
        
        return () => {
            canselled = true
            controller.abort()
        }
    }, deps)

    return state
}
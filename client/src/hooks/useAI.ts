import { useState } from "react";

type AIState = {
    loading: boolean
    result: string | null
    error: string | null
}

export function useAI() {
    const [state, setState] = useState<AIState>({
        loading: false,
        result: null,
        error: null,
    })

    const request = async (fetcher: () => Promise<string>) => {
        setState({ loading: true, result: null, error: null})
        try {
            const result = await fetcher()
            setState({ loading: false, result, error: null})
        } catch {
            setState({ loading: false, result: null, error: 'Произошла ошибка при запросе к AI' })
        }
    }

    const clear = () => setState({ loading: false, result: null, error: null })
    
    return { ...state, request, clear}
}


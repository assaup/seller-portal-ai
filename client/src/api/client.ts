type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown
    signal?: AbortSignal //отмена запроса
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { body, ...rest} = options

    const res = await fetch(url, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...rest.headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined
    })

    if (!res.ok){
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
}

export const httpClient = {
    get: <T>(url: string, signal?: AbortSignal) => 
        request<T>(url, {method: 'GET', signal}),
    put: <T>(url: string, body?: unknown) =>
        request<T>(url, {method: 'PUT', body}),
    post: <T>(url: string, body: unknown) =>
        request<T>(url, { method: 'POST', body})
}
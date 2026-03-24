// Use Vite env variable when provided (for production or custom host). During dev,
// calls should use relative paths so the Vite dev-server proxy can forward them
// and avoid CORS preflight failures.
const BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class ApiError extends Error {
    status: number
    data: unknown

    constructor(status: number, message: string, data: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}

export async function request<T>(path: string, method: HttpMethod = 'GET', body?: any, headers: Record<string, string> = {}): Promise<T> {
    const ENABLE_LOG = (import.meta as any).env?.VITE_ENABLE_API_LOGGING === 'true'
    const fullUrl = `${BASE}${path}`
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()

    if (ENABLE_LOG) {
        try {
            console.groupCollapsed && console.groupCollapsed(`[API] ${method} ${fullUrl}`)
            const [uPath, q] = fullUrl.split('?')
            console.log('→ method:', method)
            console.log('→ url:', uPath)
            if (q) {
                // simple query parser to avoid URLSearchParams typing issues in some TS configs
                const queryPairs = q.split('&').filter(Boolean)
                const query: Record<string, string> = {}
                for (const pair of queryPairs) {
                    const idx = pair.indexOf('=')
                    if (idx === -1) {
                        query[decodeURIComponent(pair)] = ''
                    } else {
                        const key = decodeURIComponent(pair.slice(0, idx))
                        const val = decodeURIComponent(pair.slice(idx + 1))
                        query[key] = val
                    }
                }
                console.log('→ query:', query)
            }
            if (body) console.log('→ body:', body)
        } catch (e) {
            console.log('[API] logging error', e)
        }
    }

    // Auto-inject X-User-Id from localStorage if available
    const authHeaders: Record<string, string> = {}
    if (typeof window !== 'undefined') {
        const storedUser = window.localStorage.getItem('tvinder_user')
        if (storedUser) {
            authHeaders['X-User-Id'] = storedUser
        }
    }

    const res = await fetch(fullUrl, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
    })

    const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    const duration = end - start

    const text = await res.text()
    let parsed: any = null
    if (text) {
        try {
            parsed = JSON.parse(text)
        } catch {
            parsed = text
        }
    }

    if (ENABLE_LOG) {
        try {
            console.log('← status:', res.status, res.statusText, `(${duration.toFixed(1)}ms)`)
            console.log('← response:', parsed)
            console.groupEnd && console.groupEnd()
        } catch (e) {
            console.log('[API] logging error', e)
        }
    }

    if (!res.ok) {
        const errMsg = typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
        throw new ApiError(res.status, errMsg || `HTTP ${res.status}`, parsed)
    }

    return (parsed ?? (null as unknown)) as T
}

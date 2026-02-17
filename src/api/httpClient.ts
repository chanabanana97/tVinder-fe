import { useErrorStore } from '../state/errorStore'

// Use Vite env variable when provided (for production or custom host). During dev,
// calls should use relative paths so the Vite dev-server proxy can forward them
// and avoid CORS preflight failures.
const BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

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
            // value is stored as simple string or JSON string of a number, but we just need the value
            // authStore uses JSON.parse so we trust it's a valid ID.
            // If stored as "5", we send "5".
            try {
                const parsed = JSON.parse(storedUser);
                authHeaders['X-User-Id'] = String(parsed);
            } catch {
                // fallback if simple string
                authHeaders['X-User-Id'] = storedUser;
            }
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

        // Handle global auth/session errors
        if (typeof window !== 'undefined') {
            const { showError } = useErrorStore.getState()

            if (res.status === 401 && !window.location.pathname.includes('/login')) {
                // Only redirect for unauthorized - user needs to login
                window.location.href = '/login';
            } else if (res.status === 403) {
                showError({
                    title: 'Access Denied',
                    message: 'You do not have permission to access this session. It may be closed or you are not a participant.',
                    actionLabel: 'Go to Sessions',
                    onAction: () => window.location.href = '/session'
                })
                window.location.href = '/error';
            } else if (res.status === 404 && window.location.pathname.includes('/session/')) {
                showError({
                    title: 'Session Not Found',
                    message: 'The session you are looking for does not exist or has ended.',
                    actionLabel: 'Go to Sessions',
                    onAction: () => window.location.href = '/session'
                })
                window.location.href = '/error';
            } else if (res.status === 500) {
                if (window.location.pathname.includes('/session/')) {
                    showError({
                        title: 'Server Error',
                        message: 'Something went wrong on our end. Please try again later.'
                    })
                    window.location.href = '/error';
                }
            }
        }

        throw new Error(errMsg || `HTTP ${res.status}`)
    }

    return (parsed ?? (null as unknown)) as T
}

import { ApiError, isApiError } from '../../api/httpClient'
import { ErrorInfo } from '../../state/errorStore'

type Navigate = (to: string) => void

type SessionErrorHandlers = {
    navigate: Navigate
    showError: (error: ErrorInfo) => void
}

export function isUnauthorizedApiError(error: unknown): error is ApiError {
    return isApiError(error) && error.status === 401
}

export function handleSessionApiError(error: unknown, handlers: SessionErrorHandlers): boolean {
    if (!isApiError(error)) {
        return false
    }

    if (error.status === 401) {
        handlers.navigate('/login')
        return true
    }

    if (error.status === 403) {
        handlers.showError({
            title: 'Access Denied',
            message: 'You do not have permission to access this session. It may be closed or you are not a participant.',
            actionLabel: 'Go to Sessions',
            onAction: () => handlers.navigate('/session')
        })
        handlers.navigate('/error')
        return true
    }

    if (error.status === 404) {
        handlers.showError({
            title: 'Session Not Found',
            message: 'The session you are looking for does not exist or has ended.',
            actionLabel: 'Go to Sessions',
            onAction: () => handlers.navigate('/session')
        })
        handlers.navigate('/error')
        return true
    }

    if (error.status >= 500) {
        handlers.showError({
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.'
        })
        handlers.navigate('/error')
        return true
    }

    return false
}
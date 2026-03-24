import { request } from './httpClient'

export function saveSwipe(sessionId: number, movieId: number, liked: boolean): Promise<void> {
    return request(`/sessions/${sessionId}/swipes`, 'POST', { movieId, liked })
}

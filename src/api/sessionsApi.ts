import { request } from './httpClient'
import { Session } from '../types/session'
import { Movie } from '../types/movie'

export function createSession(): Promise<Session> {
    return request('/sessions/create', 'POST')
}

export function endSession(sessionId: number): Promise<boolean> {
    return request(`/sessions/${sessionId}/end`, 'POST')
}


export function getSession(sessionId: number): Promise<Session> {
    return request(`/sessions/${sessionId}`, 'GET')
}

export function saveSwipe(sessionId: number, movieId: number, liked: boolean): Promise<Movie[] | null> {
    return request(`/sessions/${sessionId}/swipes`, 'POST', { movieId, liked })
}

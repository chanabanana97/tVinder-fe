import { request } from './httpClient'
import { Movie } from '../types/movie'

export function fetchSessionMovies(sessionId: number): Promise<Movie[]> {
    return request(`/sessions/${sessionId}/movies`, 'GET')
}

export function addMovies(sessionId: number, limit: number): Promise<void> {
    return request(`/sessions/add-movies?sessionId=${sessionId}&limit=${limit}`, 'POST')
}

import { request } from './httpClient'
import { Movie } from '../types/movie'

export function fetchSessionMovies(sessionId: number): Promise<Movie[]> {
    return request(`/sessions/${sessionId}/movies`, 'GET')
}

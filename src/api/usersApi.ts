import { request } from './httpClient'
import { User } from '../types/user'

export function login(username: string, password: string): Promise<number> {
    return request('/users/login', 'POST', { username, password })
}

export function createUser(username: string, password: string): Promise<User> {
    return request('/users/create', 'POST', { username, password })
}

export function createUserSession(limit: number, genreIds?: number[]) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (genreIds && genreIds.length > 0) {
        genreIds.forEach(id => params.append('genreIds', id.toString()))
    }
    return request(`/users/create-session?${params}`, 'POST')
}

export function joinSession(sessionCode: string): Promise<number> {
    return request(`/users/join-session?sessionCode=${encodeURIComponent(sessionCode)}`, 'POST')
}

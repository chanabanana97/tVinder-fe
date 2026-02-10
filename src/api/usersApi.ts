import { request } from './httpClient'
import { User } from '../types/user'

export function login(username: string, password: string): Promise<number> {
    return request('/users/login', 'POST', { username, password })
}

export function createUser(username: string, password: string): Promise<User> {
    return request('/users/create', 'POST', { username, password })
}

export function createUserSession(limit: number) {
    return request(`/users/create-session?limit=${limit}`, 'POST')
}

export function joinSession(sessionCode: string): Promise<number> {
    return request(`/users/join-session?sessionCode=${encodeURIComponent(sessionCode)}`, 'POST')
}

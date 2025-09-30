import { request } from './httpClient'
import { User } from '../types/user'

export function login(username: string, password: string): Promise<number> {
    return request('/users/login', 'POST', { username, password })
}

export function createUser(username: string, password: string): Promise<User> {
    return request('/users/create', 'POST', { username, password })
}

export function createUserSession(userId: number, limit: number) {
    return request(`/users/${userId}/create-session?limit=${limit}`, 'POST')
}

export function joinSession(userId: number, sessionCode: string): Promise<number> {
    return request(`/users/${userId}/join-session?sessionCode=${encodeURIComponent(sessionCode)}`, 'POST')
}

import { create } from 'zustand'

const storedUserId = typeof window !== 'undefined'
    ? window.localStorage.getItem('tvinder_user')
    : null

const parsedUserId = storedUserId ? Number.parseInt(storedUserId, 10) : null

type AuthState = {
    userId: number | null
    setUser: (u: number) => void
}

export const useAuth = create<AuthState>((set) => ({
    userId: Number.isNaN(parsedUserId) ? null : parsedUserId,
    setUser(userId: number) {
        window.localStorage.setItem('tvinder_user', String(userId))
        set({ userId })
    },
}))

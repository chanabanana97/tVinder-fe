import { create } from 'zustand'

type AuthState = {
    userId: number | null
    setUser: (u: number) => void
    clearUser: () => void
}

export const useAuth = create<AuthState>((set) => ({
    userId: typeof window !== 'undefined' &&
        window.localStorage.getItem('tvinder_user') ?
        JSON.parse(window.localStorage.getItem('tvinder_user')!) : null,
    setUser(userId: number) {
        window.localStorage.setItem('tvinder_user', String(userId))
        set({ userId })
    },
    clearUser() {
        window.localStorage.removeItem('tvinder_user')
        set({ userId: null })
    },
}))

import { create } from 'zustand'
import { Movie } from '../types/movie'

type SessionState = {
    sessionId: number | null
    movies: Movie[]
    likedIds: number[]
    passedIds: number[]
    setSessionId: (id: number) => void
    setMovies: (m: Movie[]) => void
}

export const useSession = create<SessionState>((set) => ({
    sessionId: null,
    movies: [],
    likedIds: [],
    passedIds: [],
    setSessionId(id) {
        set({ sessionId: id })
    },
    setMovies(m) {
        set({ movies: m })
    },
}))

import { Movie } from './movie'

export interface Session {
    id: number
    code?: string
    isActive?: boolean
    movies?: Movie[]
}

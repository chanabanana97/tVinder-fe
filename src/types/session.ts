import { Movie } from './movie'

export interface Session {
    id: number
    code?: string
    is_active?: boolean
    movies?: Movie[]
}

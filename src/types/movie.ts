export interface Movie {
    id: number
    title: string
    overview?: string
    poster_path?: string
    backdrop_path?: string
    release_date?: Date
    popularity?: number
    vote_count?: number
    vote_average?: number
}

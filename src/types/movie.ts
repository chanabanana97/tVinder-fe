export interface Movie {
    id: number
    title: string
    overview?: string
    posterPath?: string
    backdropPath?: string
    releaseDate?: Date
    popularity?: number
    voteCount?: number
    voteAverage?: number
}

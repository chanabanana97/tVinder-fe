import React from 'react'
import { Movie } from '../types/movie'

export const MovieCard: React.FC<{ movie: Movie; loading?: 'eager' | 'lazy' }> = ({ movie, loading = 'lazy' }) => {
    const IMAGE_BASE = (import.meta as any).env?.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500/'
    const posterUrl = movie.poster_path ? `${IMAGE_BASE.replace(/\/$/, '')}/${movie.poster_path.replace(/^\//, '')}` : null
    return (
        <div className="border rounded shadow p-4 h-[600px] overflow-hidden bg-white">
            <div className="h-64 sm:h-72 md:h-80 w-full mb-2 bg-gray-100 flex items-center justify-center">
                {posterUrl ? (
                    <img src={posterUrl} alt={movie.title} className="max-h-full max-w-full object-contain" loading={loading} decoding="async" />
                ) : (
                    <div className="h-80 bg-gray-200 w-full flex items-center justify-center">No Image</div>
                )}
            </div>
            <div className="overflow-hidden">
                <h3 className="text-lg font-semibold">{movie.title}</h3>
                <p className="text-sm text-gray-700">{movie.overview}</p>
                <p className="text-sm text-gray-500 mt-1">Release Date: {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</p>
                <p className="text-sm text-gray-500">Rating: {movie.vote_average ? `${movie.vote_average} (${movie.vote_count} votes)` : 'N/A'}</p>
                <p className="text-sm text-gray-500">Popularity: {movie.popularity ? movie.popularity.toFixed(1) : 'N/A'}</p>
            </div>
        </div>
    )
}

import React from 'react'
import { Movie } from '../types/movie'
import styles from './MovieCard.module.scss'

export const MovieCard: React.FC<{ movie: Movie; loading?: 'eager' | 'lazy' }> = ({ movie, loading = 'lazy' }) => {
    const IMAGE_BASE = (import.meta as any).env?.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500/'
    const posterUrl = movie.posterPath ? `${IMAGE_BASE.replace(/\/$/, '')}/${movie.posterPath.replace(/^\//, '')}` : null

    return (
        <div className={styles.movieCard}>
            <div className={styles.imageWrapper}>
                {posterUrl ? (
                    <img src={posterUrl} alt={movie.title} loading={loading} draggable={false} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 font-bold">
                        NO POSTER
                    </div>
                )}
                {movie.popularity && (
                    <div className={styles.badge}>
                        🔥 {Math.round(movie.popularity)}
                    </div>
                )}
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.mainInfo}>
                    <h3 className={styles.title}>{movie.title}</h3>
                    <div className={styles.ratingRow}>
                        {movie.voteAverage !== undefined && movie.voteAverage > 0 && (
                            <span className={styles.rating}>
                                ⭐ {movie.voteAverage.toFixed(1)}
                            </span>
                        )}
                        <span className={styles.date}>
                            {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                        </span>
                    </div>
                </div>

                <p className={styles.overview}>{movie.overview || 'No description available for this movie.'}</p>
            </div>
        </div>
    )
}

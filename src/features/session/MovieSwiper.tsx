import { useEffect, useState, useCallback, useRef } from 'react'
import { Navigate, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { fetchSessionMovies } from '../../api/moviesApi'
import { saveSwipe } from '../../api/sessionsApi'
import { useAuth } from '../../state/authStore'
import { useErrorStore } from '../../state/errorStore'
import { MovieCard } from '../../components/MovieCard'
import { MatchNotificationListener } from './MatchNotificationListener'
import { Layout } from '../../components/ui/Layout'
import { Button } from '../../components/ui/Button'
import { handleSessionApiError } from '../error/apiErrorHandling'
import styles from './MovieSwiper.module.scss'

export default function MovieSwiper() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const navigate = useNavigate()
    const userId = useAuth((s) => s.userId)
    const showError = useErrorStore((s) => s.showError)
    const { data: movies, isLoading, isError } = useQuery(
        ['sessionMovies', sessionId, userId],
        () => fetchSessionMovies(Number(sessionId)),
        {
            onError: (error) => {
                handleSessionApiError(error, { navigate, showError })
            }
        }
    )

    const [index, setIndex] = useState(() => {
        const saved = localStorage.getItem(`swipe_index_${sessionId}`)
        return saved ? parseInt(saved, 10) : 0
    })

    const [isMatchOpen, setIsMatchOpen] = useState(false)
    const [drag, setDrag] = useState({ x: 0, y: 0, angle: 0, dragging: false })
    const topRef = useRef<HTMLDivElement | null>(null)
    const threshold = 120

    const resetSwipeCard = useCallback(() => {
        setDrag({ x: 0, y: 0, angle: 0, dragging: false })
        if (topRef.current) {
            topRef.current.style.transition = ''
        }
    }, [])

    const swipeMut = useMutation(({ movieId, liked }: { movieId: number, liked: boolean }) =>
        saveSwipe(Number(sessionId), movieId, liked),
        {
            onError: (error) => {
                handleSessionApiError(error, { navigate, showError })
            }
        })

    useEffect(() => {
        if (sessionId) {
            localStorage.setItem(`swipe_index_${sessionId}`, index.toString())
        }
    }, [index, sessionId])

    const finalizeSwipe = useCallback((movieId: number, liked: boolean) => {
        swipeMut.mutate(
            { movieId, liked },
            {
                onSuccess: () => {
                    setIndex((prev) => prev + 1)
                },
                onSettled: () => {
                    resetSwipeCard()
                }
            }
        )
    }, [resetSwipeCard, swipeMut])

    const triggerSwipe = useCallback((action: 'like' | 'pass') => {
        if (isMatchOpen || swipeMut.isLoading || !movies || index >= movies.length) return
        const movieId = movies[index].id
        if (topRef.current) {
            topRef.current.style.transition = 'transform 0.3s ease-in-out'
        }

        const dir = action === 'like' ? 1 : -1
        setDrag(d => ({ ...d, x: (dir * 1000) + (d.x * 3), y: d.y + 50, dragging: false }))

        setTimeout(() => {
            finalizeSwipe(movieId, action === 'like')
        }, 300)
    }, [finalizeSwipe, index, isMatchOpen, movies, swipeMut.isLoading])

    const handleSwipe = useCallback((liked: boolean) => {
        if (isMatchOpen || swipeMut.isLoading) return
        if (!movies || index >= movies.length) return
        triggerSwipe(liked ? 'like' : 'pass')
    }, [movies, index, isMatchOpen, swipeMut.isLoading, triggerSwipe])

    const settleSwipe = (x: number) => {
        if (x > threshold) return 'like'
        if (x < -threshold) return 'pass'
        return 'reset'
    }

    const onPointerDown = (e: React.PointerEvent) => {
        if (isMatchOpen || swipeMut.isLoading) return
        (e.target as Element).setPointerCapture?.(e.pointerId)
        if (topRef.current) topRef.current.style.transition = 'none'
        setDrag({ x: 0, y: 0, angle: 0, dragging: true })
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.dragging) return
        const x = e.movementX + (drag.x || 0)
        const y = e.movementY + (drag.y || 0)
        const angle = Math.max(-30, Math.min(30, (x / 10)))
        setDrag({ x, y, angle, dragging: true })
    }

    const onPointerUp = (e: React.PointerEvent) => {
        (e.target as Element).releasePointerCapture?.(e.pointerId)
        const action = settleSwipe(drag.x)
        if (action === 'reset') {
            if (topRef.current) topRef.current.style.transition = 'transform 0.2s ease-out'
            setDrag({ x: 0, y: 0, angle: 0, dragging: false })
            return
        }
        triggerSwipe(action)
    }

    // Keyboard controls
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (isMatchOpen || swipeMut.isLoading) return
            if (e.key === 'ArrowRight' && !drag.dragging) triggerSwipe('like')
            if (e.key === 'ArrowLeft' && !drag.dragging) triggerSwipe('pass')
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [drag.dragging, isMatchOpen, swipeMut.isLoading, triggerSwipe])

    // Preload next images
    useEffect(() => {
        if (!movies || movies.length === 0) return
        const IMAGE_BASE = (import.meta as any).env?.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500/'
        const toPreload = movies.slice(index + 1, index + 3)
        const imgs: HTMLImageElement[] = []
        toPreload.forEach(m => {
            if (!m.posterPath) return
            const url = `${IMAGE_BASE.replace(/\/$/, '')}/${m.posterPath.replace(/^\//, '')}`
            const img = new Image()
            img.src = url
            imgs.push(img)
        })
        return () => { imgs.forEach(i => (i.src = '')) }
    }, [index, movies])

    if (!userId) {
        return <Navigate to="/login" replace />
    }

    if (isLoading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center p-20">
                    <div className="w-16 h-16 border-4 border-solid border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Finding the best movies for you...</p>
                </div>
            </Layout>
        )
    }

    if (isError) {
        return <Layout><div className="flex justify-center items-center h-full text-white">Session unavailable. It may have ended or you don't have access.</div></Layout>
    }

    const currentMovie = movies && index < movies.length ? movies[index] : null

    // Render stacked cards: top 2 for visual depth
    const stack = [0, 1].map(i => movies && movies[index + i]).filter(Boolean) as typeof movies

    return (
        <Layout>
            {sessionId && <MatchNotificationListener sessionId={sessionId} onMatchStateChange={setIsMatchOpen} />}

            <div className={styles.swiperContainer}>
                {currentMovie ? (
                    <>
                        <div className={styles.cardStack}>
                            {stack && stack.map((m, i) => {
                                const isTop = i === 0
                                const zIndex = 100 - i
                                const draggingStyle: React.CSSProperties = {}

                                if (isTop) {
                                    // Apply drag transform with rotation logic
                                    draggingStyle.transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.angle}deg)`
                                    draggingStyle.zIndex = 1000
                                } else {
                                    // Stack effect for cards behind
                                    draggingStyle.transform = `scale(${1 - (i * 0.05)}) translateY(${i * 10}px)`
                                    draggingStyle.zIndex = zIndex
                                    draggingStyle.filter = 'brightness(0.9)'
                                }

                                return (
                                    <div
                                        key={m.id}
                                        ref={isTop ? topRef : undefined}
                                        className={styles.swipeCard}
                                        style={draggingStyle}
                                        onPointerDown={isTop ? onPointerDown : undefined}
                                        onPointerMove={isTop ? onPointerMove : undefined}
                                        onPointerUp={isTop ? onPointerUp : undefined}
                                        onPointerCancel={isTop ? onPointerUp : undefined}
                                    >
                                        {/* Overlay Labels */}
                                        {isTop && (
                                            <>
                                                <div
                                                    className={`${styles.overlayLabel} ${styles.overlayLike}`}
                                                    style={{ opacity: Math.min(1, Math.max(0, drag.x / 80)) }}
                                                >
                                                    LIKE
                                                </div>
                                                <div
                                                    className={`${styles.overlayLabel} ${styles.overlayNope}`}
                                                    style={{ opacity: Math.min(1, Math.max(0, -drag.x / 80)) }}
                                                >
                                                    NOPE
                                                </div>
                                            </>
                                        )}

                                        <div className={styles.cardInner}>
                                            <MovieCard movie={m} loading={isTop ? 'eager' : 'lazy'} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className={styles.controls}>
                            <button
                                className={`${styles.roundButton} ${styles.passButton}`}
                                onClick={() => handleSwipe(false)}
                                disabled={swipeMut.isLoading || drag.dragging || isMatchOpen}
                                title="Pass (Left Arrow)"
                            >
                                ✕
                            </button>
                            <button
                                className={`${styles.roundButton} ${styles.likeButton}`}
                                onClick={() => handleSwipe(true)}
                                disabled={swipeMut.isLoading || drag.dragging || isMatchOpen}
                                title="Like (Right Arrow)"
                            >
                                ❤️
                            </button>
                        </div>

                        <div className="text-center text-sm font-semibold text-gray-400">
                            {index + 1} / {movies?.length} movies
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className="text-6xl mb-6">🍿</div>
                        <h2 className="text-3xl mb-2 font-bold">That's a Wrap!</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">You've reached the end of the movie list. Check back later for matches!</p>
                        <Button variant="outline" onClick={() => navigate('/session')}>Exit Room</Button>
                    </div>
                )}
            </div>
        </Layout>
    )
}

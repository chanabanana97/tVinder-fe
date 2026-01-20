import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import { fetchSessionMovies } from '../../api/moviesApi'
import { saveSwipe } from '../../api/sessionsApi'
import { useAuth } from '../../state/authStore'
import { MovieCard } from '../../components/MovieCard'
import { MatchNotificationListener } from './MatchNotificationListener'
import '../../styles/MovieSwiper.css'

export default function MovieSwiper() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const qc = useQueryClient()
    const { data: movies } = useQuery(['sessionMovies', sessionId], () => fetchSessionMovies(Number(sessionId)))

    const [index, setIndex] = useState(0)
    const [liked, setLiked] = useState<number[]>([])
    const [passed, setPassed] = useState<number[]>([])
    const userId = useAuth((s) => s.userId)

    const swipeMut = useMutation(({ movieId, liked }: { movieId: number, liked: boolean }) =>
        saveSwipe(Number(sessionId), userId!, movieId, liked)
        , {
            onError(err) {
                console.error('Failed saving swipe', err)
            }
        })


    const like = useCallback(() => {
        if (!movies) return
        setLiked((s) => [...s, movies[index].id])
        setIndex((i) => i + 1)
        // persist swipe for current user
        if (userId) swipeMut.mutate({ movieId: movies[index].id, liked: true })
    }, [movies, index])

    const pass = useCallback(() => {
        if (!movies) return
        setPassed((s) => [...s, movies[index].id])
        setIndex((i) => i + 1)
        if (userId) swipeMut.mutate({ movieId: movies[index].id, liked: false })
    }, [movies, index])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') triggerSwipe('like')
            if (e.key === 'ArrowLeft') triggerSwipe('pass')
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [like, pass])

    // Preload next 2 posters to improve perceived speed
    useEffect(() => {
        if (!movies || movies.length === 0) return
        const IMAGE_BASE = (import.meta as any).env?.VITE_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500/'
        const toPreload = movies.slice(index + 1, index + 3)
        const imgs: HTMLImageElement[] = []
        toPreload.forEach(m => {
            const path = (m as any).poster_path || (m as any).posterPath
            if (!path) return
            const url = `${IMAGE_BASE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
            const img = new Image()
            img.src = url
            imgs.push(img)
        })
        return () => { imgs.forEach(i => (i.src = '')) }
    }, [index, movies])

    // Drag/swipe state (must be declared before any early return to keep hook order stable)
    const [drag, setDrag] = useState({ x: 0, y: 0, angle: 0, dragging: false })
    const topRef = useRef<HTMLDivElement | null>(null)
    const threshold = 120

    if (!movies) return <div className="p-6">Loading...</div>
    if (index >= movies.length) {
        // show summary or navigate
        return (
            <div className="p-6">
                <h2>Finished</h2>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Liked Movies IDs:</h3>
                    <p>{liked.join(', ') || 'None'}</p>
                    <h3 className="text-lg font-semibold mt-4">Passed Movies IDs:</h3>
                    <p>{passed.join(', ') || 'None'}</p>
                </div>
            </div>
        )
    }

    const current = movies[index]


    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as Element).setPointerCapture?.(e.pointerId)
        setDrag({ x: 0, y: 0, angle: 0, dragging: true })
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.dragging) return
        // simple mapping: x -> rotate angle
        const x = e.movementX + (drag.x || 0)
        const y = e.movementY + (drag.y || 0)
        const angle = Math.max(-30, Math.min(30, (x / 10)))
        setDrag({ x, y, angle, dragging: true })
    }

    const settleSwipe = (x: number) => {
        if (x > threshold) {
            // like
            return 'like'
        }
        if (x < -threshold) {
            // pass
            return 'pass'
        }
        return 'reset'
    }

    const onPointerUp = (e: React.PointerEvent) => {
        (e.target as Element).releasePointerCapture?.(e.pointerId)
        const action = settleSwipe(drag.x)
        if (action === 'reset') {
            setDrag({ x: 0, y: 0, angle: 0, dragging: false })
            return
        }
        triggerSwipe(action)
    }

    const triggerSwipe = (action: 'like' | 'pass') => {
        // animate out
        if (topRef.current) topRef.current.classList.add('animating-out')
        const dir = action === 'like' ? 1 : -1
        const offX = (dir * 1000) + (drag.x * 3)
        setDrag(d => ({ ...d, x: offX, y: d.y + 50, dragging: false }))

        setTimeout(() => {
            if (action === 'like') like()
            else pass()
            // reset drag for next card
            setDrag({ x: 0, y: 0, angle: 0, dragging: false })
            if (topRef.current) topRef.current.classList.remove('animating-out')
        }, 300)
    }

    // match modal close
    // const closeMatch = () => setMatchMovies(null)

    // Render stacked cards: top two plus current
    const stack = [0, 1, 2].map(i => movies[index + i]).filter(Boolean)

    return (
        <div className="p-6 max-w-lg mx-auto">
            <div className="swipe-container no-select">
                <div className="card-stack">
                    {stack.map((m, i) => {
                        const z = stack.length - i
                        const isTop = i === 0
                        const classNames = ['swipe-card', `stack-${i}`, isTop ? 'top-card' : ''].join(' ')
                        const style: React.CSSProperties = {}
                        if (isTop) {
                            style.transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.angle}deg)`
                            style.zIndex = 1000
                        } else {
                            style.zIndex = 1000 - i
                        }
                        return (
                            <div
                                key={m.id}
                                ref={isTop ? topRef : undefined}
                                className={classNames}
                                style={style}
                                onPointerDown={isTop ? onPointerDown : undefined}
                                onPointerMove={isTop ? onPointerMove : undefined}
                                onPointerUp={isTop ? onPointerUp : undefined}
                                onPointerCancel={isTop ? onPointerUp : undefined}
                            >
                                {isTop && (
                                    <>
                                        <div className="overlay-label overlay-like" style={{ opacity: Math.min(1, Math.max(0, drag.x / 120)), fontSize: 28, padding: '10px 16px' }}>LIKE</div>
                                        <div className="overlay-label overlay-nope" style={{ opacity: Math.min(1, Math.max(0, -drag.x / 120)), fontSize: 28, padding: '10px 16px' }}>NOPE</div>
                                    </>
                                )}
                                <div className="card-inner">
                                    <MovieCard movie={m} loading={isTop ? 'eager' : 'lazy'} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Buttons removed: use swipe or arrow keys to like/pass */}
            {sessionId && <MatchNotificationListener sessionId={sessionId} />}
        </div>
    )
}

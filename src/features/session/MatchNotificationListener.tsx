import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Movie } from '../../types/movie'
import { MovieCard } from '../../components/MovieCard'
import { Button } from '../../components/ui/Button'

interface Props {
    sessionId: string
    onMatchStateChange?: (isOpen: boolean) => void
}

export function MatchNotificationListener({ sessionId, onMatchStateChange }: Props) {
    const [match, setMatch] = useState<Movie | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        onMatchStateChange?.(!!match)
    }, [match, onMatchStateChange])

    useEffect(() => {
        if (!sessionId) return

        // In development, use relative path so requests go through Vite proxy
        // In production, use the full URL from env
        const envUrl = (import.meta as any).env.VITE_WS_URL
        const isDev = (import.meta as any).env.DEV

        // If we have a proxy for /ws in vite.config.ts, use relative path in dev
        const socketUrl = isDev ? '/ws' : (envUrl || 'http://localhost:8080/ws')

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/match/${sessionId}`, (message) => {
                    if (message.body) {
                        try {
                            const movie = JSON.parse(message.body) as Movie
                            setMatch(movie)
                        } catch (error) {
                            console.error('Failed to parse match message.', error)
                        }
                    }
                })
            },
            onStompError: (frame) => {
                console.error('Broker reported a STOMP error.', frame.headers['message'], frame.body)
            },
            onWebSocketError: (event) => {
                console.error('WebSocket transport error.', event)
            }
        })

        client.activate()

        return () => {
            client.deactivate()
        }
    }, [sessionId])

    if (!match) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" style={{ zIndex: 3000 }}>
            <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md relative border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="text-center mb-6">
                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                        It's a Match!
                    </h3>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl mb-6 relative min-h-[300px]">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <MovieCard movie={match} loading="eager" />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => setMatch(null)}
                    >
                        Keep Swiping
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => navigate('/session')}
                    >
                        Leave Session
                    </Button>
                </div>
            </div>
        </div>
    )
}

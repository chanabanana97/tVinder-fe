import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useEffect, useState } from 'react'
import { Movie } from '../../types/movie'
import { MovieCard } from '../../components/MovieCard'

interface Props {
    sessionId: string
}

export function MatchNotificationListener({ sessionId }: Props) {
    const [match, setMatch] = useState<Movie | null>(null)

    useEffect(() => {
        if (!sessionId) return;

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
                console.log('Connected to WebSocket')
                client.subscribe(`/topic/match/${sessionId}`, (message) => {
                    if (message.body) {
                        try {
                            const movie = JSON.parse(message.body) as Movie
                            console.log('Match received via WebSocket:', movie)
                            setMatch(movie)
                        } catch (e) {
                            console.error('Failed to parse match message:', e)
                        }
                    }
                })
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            },
            onWebSocketError: (event) => {
                console.error('WebSocket Error', event)
            }
        })

        client.activate()

        return () => {
            console.log('Disconnecting WebSocket')
            client.deactivate()
        }
    }, [sessionId])

    if (!match) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 3000 }}>
            <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-red-600">It's a Match!</h3>
                    <button
                        aria-label="Close match"
                        onClick={() => setMatch(null)}
                        className="text-gray-500 hover:text-gray-800 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                    <MovieCard movie={match} loading="eager" />
                </div>

                <div className="mt-4 text-right">
                    <button
                        onClick={() => setMatch(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Keep Swiping
                    </button>
                </div>
            </div>
        </div>
    )
}

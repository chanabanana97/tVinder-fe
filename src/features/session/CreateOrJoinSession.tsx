import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createUserSession, joinSession } from '../../api/usersApi'
import { useAuth } from '../../state/authStore'
import { Session } from '../../types/session'
import { GENRES } from '../../constants/genres'

import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Layout } from '../../components/ui/Layout'

export default function CreateOrJoinSession() {
    const [limit, setLimit] = useState(10)
    const [code, setCode] = useState('')
    const [selectedGenres, setSelectedGenres] = useState<number[]>([])
    const [createdSession, setCreatedSession] = useState<Session | null>(null)
    const [copied, setCopied] = useState(false)
    const user = useAuth((s) => s.userId)
    const navigate = useNavigate()

    const MAX_GENRES = 3

    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev => {
            if (prev.includes(genreId)) {
                return prev.filter(id => id !== genreId)
            }
            if (prev.length >= MAX_GENRES) {
                return prev
            }
            return [...prev, genreId]
        })
    }

    const createMut = useMutation(() => createUserSession(limit, selectedGenres.length > 0 ? selectedGenres : undefined), {
        onSuccess(session: any) {
            // store created session so user can copy the code and start the session manually
            setCreatedSession(session)
        },
    })

    const joinMut = useMutation((code: string) => joinSession(code), {
        onSuccess: (sessionId: number) => {
            navigate(`/session/${sessionId}`)
        },
    })

    return (
        <Layout>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* Create section */}
                <Card
                    title="Host a Session"
                    subtitle="Create a room and invite friends"
                >
                    <div className="space-y-4">
                        <Input
                            label="Movie Limit"
                            type="number"
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Genres (optional, max 3)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(genre => {
                                    const isSelected = selectedGenres.includes(genre.id)
                                    const isDisabled = !isSelected && selectedGenres.length >= MAX_GENRES
                                    return (
                                        <button
                                            key={genre.id}
                                            type="button"
                                            onClick={() => toggleGenre(genre.id)}
                                            disabled={isDisabled}
                                            className={`
                                                px-3 py-2 rounded-lg text-sm font-medium transition-all
                                                min-h-[44px] touch-manipulation
                                                ${isSelected
                                                    ? 'bg-[#FF4B6E] text-white shadow-md scale-105'
                                                    : isDisabled
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
                                                }
                                            `}
                                        >
                                            {genre.name}
                                        </button>
                                    )
                                })}
                            </div>
                            {selectedGenres.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600">
                                    {selectedGenres.length}/{MAX_GENRES} selected
                                </div>
                            )}
                        </div>

                        {!createdSession ? (
                            <Button
                                fullWidth
                                onClick={() => createMut.mutate()}
                                disabled={!user || createMut.isLoading}
                            >
                                {createMut.isLoading ? 'Creating...' : 'Create New Room'}
                            </Button>
                        ) : (
                            <div className="mt-4 bg-gray-50 p-4 rounded-xl border-dashed border-2 border-primary/20">
                                <div className="text-sm text-gray-700 font-bold mb-2">Room Code:</div>
                                <div className="flex gap-2">
                                    <input
                                        className="bg-white border rounded-lg px-3 py-2 flex-1 font-mono text-lg tracking-widest text-[#FF4B6E]"
                                        value={createdSession.code ?? ''}
                                        readOnly
                                    />
                                    <button
                                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors border"
                                        onClick={async () => {
                                            const text = createdSession.code ?? ''
                                            try {
                                                await navigator.clipboard.writeText(text)
                                                setCopied(true)
                                                setTimeout(() => setCopied(false), 1500)
                                            } catch (e) { }
                                        }}
                                    >
                                        {copied ? '✅' : '📋'}
                                    </button>
                                </div>
                                <Button
                                    className="mt-4"
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => createdSession.code && joinMut.mutate(createdSession.code)}
                                >
                                    Jump In!
                                </Button>
                                {copied && <div className="text-xs text-green-600 mt-2 text-center">Code copied to clipboard!</div>}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Join section */}
                <Card
                    title="Join Friend"
                    subtitle="Enter a code to start matching"
                >
                    <div className="space-y-4">
                        <Input
                            label="Join code"
                            placeholder="e.g. ABCD-1234"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                        />
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => joinMut.mutate(code)}
                            disabled={!user || !code || joinMut.isLoading}
                        >
                            {joinMut.isLoading ? 'Joining...' : 'Join Room'}
                        </Button>

                        {joinMut.isError && (
                            <div className="text-red-500 text-sm text-center font-medium mt-2">
                                Room not found. Check the code and try again.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </Layout>
    )
}

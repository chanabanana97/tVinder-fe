import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createUserSession, joinSession } from '../../api/usersApi'
import { useAuth } from '../../state/authStore'
import { Session } from '../../types/session'

export default function CreateOrJoinSession() {
    const [limit, setLimit] = useState(10)
    const [code, setCode] = useState('')
    const [createdSession, setCreatedSession] = useState<Session | null>(null)
    const [copied, setCopied] = useState(false)
    const user = useAuth((s) => s.userId)
    const navigate = useNavigate()

    const createMut = useMutation((limit: number) => createUserSession(user!, limit), {
        onSuccess(session: any) {
            // store created session so user can copy the code and start the session manually
            setCreatedSession(session)
        },
    })

    const joinMut = useMutation((code: string) => joinSession(user!, code), {
        onSuccess: (sessionId: number) => {
            navigate(`/session/${sessionId}`)
        },
    })

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold">Create or Join Session</h2>
            <div className="mt-4 space-y-6">
                {/* Create section - card */}
                <div className="p-4 border rounded-lg shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <label className="mr-2">Limit</label>
                            <input
                                type="number"
                                value={limit}
                                onChange={e => setLimit(Number(e.target.value))}
                                className="border p-1 w-24"
                            />
                        </div>
                        <div>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => createMut.mutate(limit)}
                                disabled={!user || createMut.isLoading}
                            >
                                {createMut.isLoading ? 'Creating...' : 'Create session'}
                            </button>
                        </div>
                    </div>

                    {createdSession && (
                        <div className="mt-4 bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-700 font-medium">Session created</div>
                            <div className="mt-2 flex items-center">
                                <input
                                    className="border p-2 w-56 mr-3 bg-white"
                                    value={createdSession.code ?? ''}
                                    readOnly
                                />
                                <button
                                    className="px-3 py-1 bg-indigo-500 text-white rounded mr-2 flex items-center justify-center"
                                    aria-label="Copy session code"
                                    title="Copy session code"
                                    onClick={async () => {
                                        const text = createdSession.code ?? ''
                                        try {
                                            await navigator.clipboard.writeText(text)
                                            setCopied(true)
                                            setTimeout(() => setCopied(false), 1500)
                                        } catch (e) {
                                            // noop fallback — input is selectable
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6a2 2 0 012 2v11a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </button>
                                <button
                                    className="px-3 py-1 bg-green-600 text-white rounded"
                                    onClick={() => createdSession.code && joinMut.mutate(createdSession.code)}
                                >
                                    Start session
                                </button>
                            </div>
                            {copied && <div className="text-xs text-green-600 mt-2">Copied!</div>}
                        </div>
                    )}
                </div>

                {/* Join section - separate card */}
                <div className="p-4 border rounded-lg shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <label className="mr-2">Join code</label>
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="border p-1 w-48"
                            />
                        </div>
                        <div>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded"
                                onClick={() => joinMut.mutate(code)}
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

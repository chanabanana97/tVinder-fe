import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createUserSession, joinSession } from '../../api/usersApi'
import { useAuth } from '../../state/authStore'

export default function CreateOrJoinSession() {
    const [limit, setLimit] = useState(10)
    const [code, setCode] = useState('')
    const user = useAuth((s) => s.userId)
    const navigate = useNavigate()

    const createMut = useMutation((limit: number) => createUserSession(user!, limit), {
        onSuccess(session: any) {
            navigate(`/session/${session.id}`)
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
            <div className="mt-4">
                <div>
                    <label>Limit</label>
                    <input type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} className="border p-1 ml-2" />
                    <button className="ml-2 px-3 py-1 bg-blue-500 text-white" onClick={() => createMut.mutate(limit)}>Create</button>
                </div>
                <div className="mt-4">
                    <label>Join code</label>
                    <input value={code} onChange={e => setCode(e.target.value)} className="border p-1 ml-2" />
                    <button className="ml-2 px-3 py-1 bg-green-500 text-white" onClick={() => joinMut.mutate(code)}>Join</button>
                </div>
            </div>
        </div>
    )
}

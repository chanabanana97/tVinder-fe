import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createUser } from '../../api/usersApi'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const mutation = useMutation((data: { username: string; password: string }) =>
        createUser(data.username, data.password),
        {
            onSuccess() {
                navigate('/login')
            },
        }
    )

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <input className="block mb-2 p-2 border" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="block mb-4 p-2 border" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="px-4 py-2 bg-green-600 text-white" onClick={() => mutation.mutate({ username, password })}>Register</button>
            {mutation.isError && <div className="text-red-600 mt-2">Registration failed</div>}
        </div>
    )
}

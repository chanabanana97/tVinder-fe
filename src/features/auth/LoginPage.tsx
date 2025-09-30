import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { login } from '../../api/usersApi'
import { useAuth } from '../../state/authStore'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const setUserId = useAuth((s) => s.setUser)

    const mutation = useMutation((data: { username: string; password: string }) =>
        login(data.username, data.password),
        {
            onSuccess(userId) {
                setUserId(userId)
                navigate('/session')
            },
        }
    )

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <input className="block mb-2 p-2 border" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="block mb-4 p-2 border" placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="px-4 py-2 bg-blue-600 text-white" onClick={() => mutation.mutate({ username, password })}>Login</button>
            {mutation.isError && <div className="text-red-600 mt-2">Login failed</div>}
        </div>
    )
}

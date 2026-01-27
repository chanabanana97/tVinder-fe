import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from 'react-query'
import { login } from '../../api/usersApi'
import { useAuth } from '../../state/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Layout } from '../../components/ui/Layout'

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
        <Layout>
            <Card
                title="Welcome Back!"
                subtitle="Sign in to start matching movies"
                className="max-w-md w-full"
            >
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        mutation.mutate({ username, password })
                    }}
                >
                    <Input
                        label="Username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        disabled={mutation.isLoading}
                    >
                        {mutation.isLoading ? 'Signing in...' : 'Login'}
                    </Button>

                    <div className="text-center mt-6 text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline" style={{ color: '#FF4B6E' }}>
                            Register here
                        </Link>
                    </div>

                    {mutation.isError && (
                        <div className="text-red-500 text-sm text-center mt-2 font-medium">
                            Login failed. Please check your credentials.
                        </div>
                    )}
                </form>
            </Card>
        </Layout>
    )
}

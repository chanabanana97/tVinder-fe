import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from 'react-query'
import { createUser } from '../../api/usersApi'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Layout } from '../../components/ui/Layout'

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
        <Layout>
            <Card
                title="Create Account"
                subtitle="Join tVinder and find movies with friends"
                className="max-w-md w-full"
            >
                <div className="space-y-4">
                    <Input
                        label="Username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <Input
                        label="Password"
                        placeholder="Create a password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => mutation.mutate({ username, password })}
                        disabled={mutation.isLoading}
                    >
                        {mutation.isLoading ? 'Creating account...' : 'Register'}
                    </Button>

                    <div className="text-center mt-6 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-secondary font-bold hover:underline" style={{ color: '#00D09C' }}>
                            Sign in
                        </Link>
                    </div>

                    {mutation.isError && (
                        <div className="text-red-500 text-sm text-center mt-2 font-medium">
                            Registration failed. Try a different username.
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    )
}

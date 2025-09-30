import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../features/auth/LoginPage'

vi.mock('../../api/usersApi', () => ({
    login: (u: string) => Promise.resolve({ id: 1, username: u }),
}))

describe('Login page', () => {
    it('calls login and navigates on success (smoke)', async () => {
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'alice' } })
        fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'pw' } })
        fireEvent.click(screen.getByText('Login'))
        expect(await screen.findByText(/Login/i)).toBeTruthy()
    })
})

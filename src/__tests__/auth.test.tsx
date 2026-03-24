import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import LoginPage from '../features/auth/LoginPage'
import { useAuth } from '../state/authStore'

const navigateMock = vi.fn()
const loginMock = vi.fn()

vi.mock('../api/usersApi', () => ({
    login: (...args: unknown[]) => loginMock(...args),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigateMock,
    }
})

function renderLoginPage() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('Login page', () => {
    beforeEach(() => {
        navigateMock.mockReset()
        loginMock.mockReset()
        useAuth.setState({ userId: null })
        window.localStorage.clear()
    })

    it('calls login, stores the user id, and navigates on success', async () => {
        loginMock.mockResolvedValue(7)

        renderLoginPage()

        fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'alice' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pw' } })
        fireEvent.click(screen.getByText('Login'))

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith('alice', 'pw')
        })
        expect(useAuth.getState().userId).toBe(7)
        expect(window.localStorage.getItem('tvinder_user')).toBe('7')
        expect(navigateMock).toHaveBeenCalledWith('/session')
    })

    it('shows an error message when login fails', async () => {
        loginMock.mockRejectedValue(new Error('boom'))

        renderLoginPage()

        fireEvent.change(screen.getByPlaceholderText('Enter your username'), { target: { value: 'alice' } })
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'bad' } })
        fireEvent.click(screen.getByText('Login'))

        expect(await screen.findByText('Login failed. Please check your credentials.')).toBeInTheDocument()
        expect(navigateMock).not.toHaveBeenCalled()
    })
})

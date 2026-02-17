import { create } from 'zustand'

export type ErrorInfo = {
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
}

type ErrorState = {
    error: ErrorInfo | null
    showError: (error: ErrorInfo) => void
    clearError: () => void
}

export const useErrorStore = create<ErrorState>((set) => ({
    error: null,
    showError: (error: ErrorInfo) => set({ error }),
    clearError: () => set({ error: null }),
}))

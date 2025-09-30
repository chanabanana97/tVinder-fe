import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import CreateOrJoinSession from '../features/session/CreateOrJoinSession'
import MovieSwiper from '../features/session/MovieSwiper'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/session" element={<CreateOrJoinSession />} />
            <Route path="/session/:sessionId" element={<MovieSwiper />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

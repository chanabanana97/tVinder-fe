import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        // Proxy API requests during development to avoid CORS issues.
        // Requests to /api or /users will be forwarded to the backend at localhost:8080
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/users': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/sessions': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/movies': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: 'http://localhost:8080',
                ws: true,
                changeOrigin: true,
                secure: false,
            },
            '/auth': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})

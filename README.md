# tVinder (frontend)

This is a scaffolded React + TypeScript single-page app (Vite) for the tVinder demo.

Features
- React + TypeScript
- React Query for data fetching
- TailwindCSS for styling
- Zustand (optional) for small client state
- Vitest + Testing Library for tests

Environment
- Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your Spring Boot backend.

Notes and assumptions
- Backend has no auth token; this app stores the returned user object in localStorage and in-memory.
- GET /sessions?sessionId=... is used as provided by the backend; recommended improvement: GET /sessions/{sessionId}.
- No endpoint to persist likes; likes are kept client-side only.

Run
1. npm install
2. npm run dev
# tVinder-fe
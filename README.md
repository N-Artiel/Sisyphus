# Sisyphus

A small task & project tracker: sign up, create projects, add tasks to them, and only ever see your own data. Built as a hands-on internship-prep exercise covering a typed API, real auth, row-level database security, and a containerized setup someone else could run with one command.

## Stack

- **Frontend**: React + TypeScript, built with Vite, routed with React Router
- **Backend**: Express + TypeScript (Node.js), REST API
- **Database & Auth**: Supabase (hosted Postgres + Auth), Row Level Security enforced at the database level
- **Containers**: Docker, orchestrated with `docker-compose.yml`, run locally via OrbStack

## Architecture

Browser
│
├── React app (frontend container, nginx on :80 → host :8080)
│ └── Supabase Auth (sign in/up, session token)
│ └── Backend API for data (fetch with Bearer token)
│
└── Express API (backend container, :3000)
└── Supabase (service role key — queries filtered manually by user_id, RLS as a second layer)


The frontend talks to Supabase Auth directly for sign-in/sign-up. All project/task data goes through the backend, which verifies the user's JWT on every protected route and only ever returns/modifies that user's own rows — enforced both in application code and by Postgres Row Level Security policies, so a bug in one layer doesn't expose data through the other.

## Project structure

Sisyphus/
├── frontend/ React + TS app
├── backend/ Express + TS API
├── supabase/ SQL migrations (projects, tasks, RLS policies)
├── docker-compose.yml Runs both containers together
├── .env Root-level, frontend build args for docker-compose (gitignored)
└── .claude/ AI tooling guardrails (see below)


## Environment variables

**`backend/.env`**

PORT=3000
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase Secret key>


**`frontend/.env`**

VITE_SUPABASE_URL=<your Supabase project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase Publishable key>
VITE_API_URL=http://localhost:3000


**`.env`** (repo root — used only by `docker-compose.yml` for the frontend's build args)

VITE_SUPABASE_URL=<same as above>
VITE_SUPABASE_ANON_KEY=<same as above>
VITE_API_URL=http://localhost:3000


None of these are committed — see `.env.example` for the template. Get your project URL and keys from the Supabase dashboard under Project Settings → API.

## Running it

**Everything, containerized (recommended):**
```bash
docker compose up --build
```
Frontend on http://localhost:8080, API on http://localhost:3000.

**Individually, for development:**
```bash
# backend
cd backend && npm install && npm run dev

# frontend, separate terminal
cd frontend && npm install && npm run dev
```

## Database migrations

Schema changes live as SQL files in `supabase/migrations/`. To apply them to the linked cloud project:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## AI tooling guardrails

This repo includes `.claude/settings.json` and `.claude/hooks/guard-secrets.js`, which prevent Claude Code from reading `.env` files and require explicit confirmation before running destructive or credential-sensitive commands (`supabase db push/reset`, `supabase link`, `psql`). These only apply when running Claude Code directly in this folder.

## Status

Core functionality complete: auth, CRUD for projects/tasks, RLS, both services containerized and verified with a clean `docker compose up --build`. Visual design is a separate, upcoming pass.
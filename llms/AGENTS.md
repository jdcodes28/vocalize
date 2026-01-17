# AGENTS.md — Build Instructions for Coding Agents (Polished + Dual Mode)

## Hard Rules
1) Do not implement any transcription or mic recording in the hosted preview build.
2) Preview Mode must never call the backend or request mic permission.
3) Local Mode must work via Docker Compose on a clean machine.
4) Keep the repo small and readable; avoid unnecessary frameworks/services.

## Output Files Required
- `SPEC.md`
- `ARCHITECTURE.md`
- `DESIGN.md`
- `README.md`
- `docker-compose.yml`
- Frontend code in `/frontend`
- Backend code in `/backend`

## Phase 0 — Repo Bootstrap
- [ ] Create repo structure:
  - `/frontend` (Astro + Tailwind + shadcn/ui + React island)
  - `/backend` (FastAPI)
- [ ] Commit: “chore: bootstrap repo layout”

## Phase 1 — Frontend (Preview Mode First)
Goal: The Vercel-deployable preview must look great and be impossible to “break.”

- [ ] Initialize Astro project in `/frontend`
- [ ] Add Tailwind
- [ ] Add shadcn/ui (Astro + React integration)
- [ ] Implement the page layout from `DESIGN.md`:
  - Header
  - Recorder Card
  - CTA Block (above fold)
- [ ] Implement `PUBLIC_APP_MODE` handling:
  - If `preview`:
    - Record button disabled
    - Transcript shows “Example output”
    - No microphone permission request (no `getUserMedia` calls)
    - No backend calls
- [ ] Add a small config module:
  - `mode = import.meta.env.PUBLIC_APP_MODE ?? "local"`
  - `backendUrl = import.meta.env.PUBLIC_BACKEND_URL ?? "http://localhost:8000"`
- [ ] Commit: “feat(frontend): preview-mode UI shell with blue theme”

## Phase 2 — Frontend (Local Mode Recording)
- [ ] Add `RecorderIsland` React component:
  - States: idle | recording | processing | done | error
  - Detect supported mime types for MediaRecorder
  - Start/Stop recording
  - Create Blob + object URL for playback
- [ ] In Local Mode only:
  - Request mic permission on “Record” click
  - Upload blob to backend `/api/transcribe` via multipart FormData
  - Display transcript returned
  - Copy-to-clipboard button
- [ ] Ensure Preview Mode still has **zero** mic/backend behavior.
- [ ] Commit: “feat(frontend): local-mode recording + transcript rendering”

## Phase 3 — Backend (FastAPI + faster-whisper)
- [ ] Create FastAPI app in `/backend/app/main.py`
- [ ] Implement GET `/api/health`
- [ ] Implement POST `/api/transcribe`:
  - Accept UploadFile field name `file`
  - Save to temp file
  - Convert via ffmpeg -> 16k mono wav
  - Transcribe via faster-whisper (default model: `small`)
  - Return JSON: `text`, `language`, `duration_sec`, optional `segments`, `model`, `device`
  - Cleanup temp files in `finally`
- [ ] Add simple global async lock to serialize transcription (MVP stability)
- [ ] Add CORS to allow local frontend origin (e.g. `http://localhost:4321`)
- [ ] Commit: “feat(backend): local transcription endpoint via faster-whisper”

## Phase 4 — Docker Compose (Local One-Command Run)
- [ ] Create `docker-compose.yml` with services:
  - `backend`: includes Python deps + ffmpeg + faster-whisper
  - `frontend`: builds Astro and serves
- [ ] Set env for local mode:
  - `PUBLIC_APP_MODE=local`
  - `PUBLIC_BACKEND_URL=http://backend:8000` (compose network URL)
- [ ] Expose ports:
  - frontend: 4321:4321 (or 3000:3000)
  - backend: 8000:8000
- [ ] Verify end-to-end:
  - `docker compose up --build`
  - open frontend, record, transcript appears
- [ ] Commit: “feat(docker): compose-based local run”

## Phase 5 — README + Vercel Preview Setup
- [ ] Write `README.md` with:
  - What it is (dual-mode)
  - Hosted preview explanation (UI-only)
  - Local run instructions (docker compose)
  - Troubleshooting (mic permission, browser support)
- [ ] Frontend build instructions for Vercel:
  - Set `PUBLIC_APP_MODE=preview`
  - Do not set any backend URL
- [ ] Include 1 screenshot or gif placeholder section (optional)
- [ ] Commit: “docs: README with preview + local instructions”

## Definition of Done
- Hosted preview:
  - Looks polished
  - Recording disabled intentionally
  - No mic prompt ever
  - No backend calls ever
- Local compose:
  - Works on a clean machine with `docker compose up --build`
  - Recording + transcription works end-to-end
  - Errors are readable

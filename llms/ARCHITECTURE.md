# ARCHITECTURE.md — Hosted Preview + Local Compose (Astro + Tailwind + shadcn/ui)

## Overview
Two targets:

### A) Hosted Preview (Vercel)
- Astro frontend only
- `PUBLIC_APP_MODE=preview`
- No backend
- No mic access
- No transcription
- No network calls to `/api/*`

### B) Local (Docker Compose)
- Astro frontend container
- Python FastAPI backend container
- Whisper runs locally in backend container
- ffmpeg available in backend container

## Frontend
- Astro + Tailwind + shadcn/ui
- One interactive island (React):
  - `RecorderIsland.tsx` handles state + recording + uploading
  - In Preview Mode: UI disabled, shows example output + local-run CTA
  - In Local Mode: uses MediaRecorder + fetch upload

### Preview Mode Toggle
- Build-time env var: `PUBLIC_APP_MODE=preview|local`
- Behavior rules:
  - If `preview`: **never** request mic permission, **never** call backend
  - If `local`: enable recording, call backend URL

### Backend Base URL
- In Local Mode:
  - Default: `http://localhost:8000`
  - Frontend reads `PUBLIC_BACKEND_URL` (optional) else defaults to localhost

## Backend (Local only)
- FastAPI (Uvicorn) on port 8000

Endpoints:
- GET `/api/health`
- POST `/api/transcribe`
  - Accept multipart upload field `file`
  - Convert to WAV 16kHz mono via ffmpeg
  - Transcribe via faster-whisper
  - Return JSON:
    - `text`, `language`, `duration_sec`, `segments` (optional), `model`, `device`

## Audio Normalization
- Convert any input to 16k mono WAV:
  - `ffmpeg -y -i input -ac 1 -ar 16000 output.wav`
- Store temp files in OS temp dir; delete on completion/failure

## Concurrency
- Use a simple global async lock so only one transcription runs at a time (MVP)
- Return a 429 or “busy” response if a request arrives while locked (optional)

## Docker Compose
- `frontend`
  - Builds Astro app
  - Runs on port 4321 (Astro default) or 3000 (acceptable)
  - `PUBLIC_APP_MODE=local`

- `backend`
  - Python + ffmpeg + faster-whisper
  - Exposes port 8000

## Guardrails
- Preview Mode must feel intentional:
  - Disabled controls + explanation copy + CTA
  - Example transcript labeled as example
- Local Mode should fail loudly and clearly:
  - Mic permission issues
  - Backend unreachable
  - Transcription error

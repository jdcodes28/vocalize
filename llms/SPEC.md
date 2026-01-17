# SPEC.md — Voice Recorder UI + Local Whisper Transcription (Dual Mode)

## Goal
Ship:
1) A polished **hosted UI preview** (no mic, no transcription) for recruiters
2) A fully working **local version** via Docker Compose (record + transcribe locally)

## Modes
### Preview Mode (Hosted on Vercel)
- Recording: **disabled**
- Transcription: **disabled**
- Purpose: visual/UX preview only
- Must clearly explain how to run locally to try real functionality
- Must not attempt any backend calls

### Local Mode (Docker Compose)
- Recording: enabled (browser mic)
- Transcription: enabled (local backend using Whisper)
- No cloud services required

## User Flow (Local Mode)
1) User runs `docker compose up --build`
2) Opens the web UI
3) Records audio (start/stop)
4) Audio uploads to local backend
5) Transcript displays + copy

## Functional Requirements
Preview Mode:
- UI renders identically to Local Mode (same layout/components)
- Controls disabled + clear “Preview mode” messaging
- Transcript area shows an **example** transcript (clearly labeled)
- “Try it locally” steps are visible above the fold

Local Mode:
- Mic permission request + clear error states
- Record start/stop
- Playback recorded audio
- Upload to backend and show transcript
- Loading + backend error display

## Non-Goals (MVP)
- Auth, accounts, cloud transcription
- Speaker diarization
- Word-level timestamps

## Privacy
- In Local Mode, audio stays on the machine
- Backend may write temp files; must delete after transcription

## Success Criteria
- Hosted preview looks intentional and professional (not “broken”)
- Local mode works via Docker on a fresh machine with minimal steps

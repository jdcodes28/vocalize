# Plan Overview — Vocalize Project

## Project Summary
Build a dual-mode voice recorder web application:
- **Preview Mode**: Hosted on Vercel, UI-only (no mic, no backend)
- **Local Mode**: Full functionality via Docker Compose (record + transcribe)

## Hard Rules (Must Never Violate)
1. Preview Mode must **never** call `getUserMedia()` or request mic permission
2. Preview Mode must **never** make backend API calls
3. Local Mode must work via `docker compose up --build` on a clean machine
4. Keep the repo small and readable
5. **All development happens inside `nix-shell`** — no global package installations

## Development Environment
This project uses Nix for reproducible development. All commands must be run inside:
```bash
nix-shell
```

The shell provides:
- Node.js 24 LTS (latest LTS, Vercel compatible)
- Python 3.14 (latest stable)
- ffmpeg for audio processing
- curl, jq utilities

## Tech Stack
| Layer | Technology |
|-------|------------|
| Dev Environment | Nix |
| Frontend Framework | Astro |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Interactive Islands | React |
| Backend | FastAPI (Python) |
| Transcription | faster-whisper |
| Audio Processing | ffmpeg |
| Containerization | Docker Compose |

## Output Files Required
- `shell.nix` - Nix development environment
- `/frontend/` - Astro application
- `/backend/` - FastAPI application
- `docker-compose.yml` - Local orchestration
- `README.md` - Documentation

## Plan File Index
| File | Description | Commit Message |
|------|-------------|----------------|
| 01-phase0-bootstrap.md | Nix shell + folder structure | `chore: bootstrap repo layout with nix shell` |
| 02-phase1a-astro-tailwind.md | Initialize Astro + Tailwind | `chore(frontend): init astro with tailwind` |
| 03-phase1b-shadcn-react.md | Add shadcn/ui + React | `chore(frontend): add shadcn-ui and react` |
| 04-phase1c-config-module.md | Environment config | `feat(frontend): add app mode config` |
| 05-phase1d-ui-layout.md | Preview mode UI | `feat(frontend): preview-mode UI shell with blue theme` |
| 06-phase2-recorder-island.md | Local mode recording | `feat(frontend): local-mode recording + transcript rendering` |
| 07-phase3a-backend-setup.md | FastAPI structure | `chore(backend): init fastapi project` |
| 08-phase3b-transcribe.md | Transcription endpoint | `feat(backend): local transcription endpoint via faster-whisper` |
| 09-phase4-docker.md | Docker Compose | `feat(docker): compose-based local run` |
| 10-phase5-docs.md | README | `docs: README with preview + local instructions` |

## Definition of Done
### Preview Mode (Hosted)
- [ ] Looks polished and intentional
- [ ] Recording button disabled with explanation
- [ ] Example transcript shown (clearly labeled)
- [ ] No mic permission prompt ever
- [ ] No backend calls ever
- [ ] CTA with local run instructions visible

### Local Mode (Docker Compose)
- [ ] Works on clean machine with single command
- [ ] Recording + transcription works end-to-end
- [ ] Errors are readable and helpful
- [ ] Temp files cleaned up after transcription

### Development Environment
- [ ] `nix-shell` provides all required tools
- [ ] No global package installations required
- [ ] Frontend runs with `npm run dev`
- [ ] Backend runs with helper scripts

# Phase 5 — Documentation

## Goal
Write comprehensive README with dual-mode explanation and setup instructions.

## Commit
```
docs: README with preview + local instructions
```

## Tasks

### 1. Create README.md
Create `README.md` in project root:

```markdown
# Vocalize — Vocalize

A voice recording and transcription web app that runs **100% locally** using OpenAI's Whisper model.

## Dual Mode Architecture

This project has two modes:

| Mode | Where | Recording | Transcription | Purpose |
|------|-------|-----------|---------------|---------|
| **Preview** | Hosted (Vercel) | Disabled | Disabled | Demo the UI |
| **Local** | Docker Compose | Enabled | Enabled | Full functionality |

### Why Two Modes?

The hosted preview lets you see the UI without running anything locally. It's intentionally limited — no mic access, no backend calls. To use the actual transcription features, run it locally with Docker.

## Quick Start (Local)

### Prerequisites
- Docker and Docker Compose
- A microphone
- A modern browser (Chrome, Firefox, Edge)

### Run

```bash
git clone <repo-url>
cd vocalize
docker compose up --build
```

Then open [http://localhost:4321](http://localhost:4321)

### First Run Notes
- The first transcription request downloads the Whisper model (~500MB)
- Subsequent runs use the cached model
- CPU transcription works but is slower than GPU

## Usage

1. Click **Start Recording**
2. Allow microphone permission when prompted
3. Speak into your microphone
4. Click **Stop Recording**
5. Wait for transcription (a few seconds on CPU)
6. Copy the transcript or record again

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLIC_APP_MODE` | `local` | `preview` or `local` |
| `PUBLIC_BACKEND_URL` | `http://localhost:8000` | Backend API URL |
| `WHISPER_MODEL` | `small` | Whisper model size |

### Whisper Model Sizes

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| `tiny` | ~75MB | Fastest | Lower |
| `base` | ~150MB | Fast | Good |
| `small` | ~500MB | Medium | Better |
| `medium` | ~1.5GB | Slow | High |
| `large-v3` | ~3GB | Slowest | Highest |

To change the model, edit `docker-compose.yml`:
```yaml
backend:
  environment:
    - WHISPER_MODEL=base  # or tiny, medium, large-v3
```

## Troubleshooting

### "Microphone permission denied"
- Click the lock/camera icon in your browser's address bar
- Set microphone permission to "Allow"
- Refresh the page

### "Backend unreachable"
- Ensure Docker containers are running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Verify port 8000 is not in use

### "Transcription is slow"
- CPU transcription is slower than GPU
- Try a smaller model: `WHISPER_MODEL=tiny`
- For faster results, use a machine with NVIDIA GPU

### Browser Not Supported
- MediaRecorder API required
- Use Chrome, Firefox, or Edge
- Safari has limited support

## Development

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Backend Only
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Both (without Docker)
Run frontend and backend in separate terminals, then access http://localhost:4321

## Tech Stack

- **Frontend**: Astro, React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, faster-whisper
- **Containerization**: Docker, Docker Compose

## Privacy

- Audio is recorded in your browser
- Audio is sent to the local backend container
- Transcription happens on your machine
- No data leaves your computer
- Temp files are deleted after transcription

## License

MIT
```

### 2. Update CTABlock with Real Repo URL
After the repo is created, update `src/components/CTABlock.tsx`:
```tsx
const commands = [
  "git clone https://github.com/username/vocalize.git",  // Update with real URL
  "cd vocalize",
  "docker compose up --build",
];
```

### 3. Add Vercel Configuration (Optional)
Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "installCommand": "npm install"
}
```

Note: For Vercel deployment, set environment variable:
- `PUBLIC_APP_MODE=preview`

## Expected Files After This Phase
```
vocalize/
├── README.md
├── frontend/
│   └── vercel.json (optional)
└── ...
```

## Verification Checklist
- [ ] README renders correctly on GitHub/Forgejo
- [ ] Quick start instructions work on a fresh machine
- [ ] All troubleshooting items are accurate
- [ ] Links to localhost ports are correct
- [ ] No broken markdown formatting

## Final Project Structure
```
vocalize/
├── README.md
├── CLAUDE.md
├── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── CTABlock.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ModeBadge.tsx
│   │   │   └── RecorderIsland.tsx
│   │   ├── hooks/
│   │   │   └── useRecorder.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── config.ts
│   │   │   ├── recorder-types.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   └── index.astro
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── env.d.ts
│   ├── public/
│   ├── astro.config.mjs
│   ├── components.json
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.mjs
│   ├── tsconfig.json
│   └── vercel.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── transcribe.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .gitignore
└── llms/
    ├── AGENTS.md
    ├── ARCHITECTURE.md
    ├── DESIGN.md
    ├── SPEC.md
    └── plans/
```

## Notes
- README should be updated with actual repo URL before publishing
- Vercel deployment requires setting PUBLIC_APP_MODE=preview in dashboard
- Consider adding a screenshot/gif section after first deployment

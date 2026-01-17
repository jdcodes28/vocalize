# Vocalize

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

### Build Notes
- The Whisper model (~500MB) is downloaded during `docker compose build`
- Once built, the app starts instantly with no additional downloads
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

## Development

### With Nix (NixOS/macOS/Linux)

```bash
nix-shell
dev
```

This starts both frontend and backend natively with hot reload.

### Without Nix

Use Docker Compose:

```bash
docker compose up --build
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

## Tech Stack

- **Frontend**: Astro, React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, faster-whisper
- **Containerization**: Docker, Docker Compose
- **Development**: Nix

## Privacy

- Audio is recorded in your browser
- Audio is sent to the local backend
- Transcription happens entirely on your machine
- **No data leaves your computer**
- Temp files are written to disk during processing, then immediately deleted

## License

MIT

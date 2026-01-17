# Phase 4 — Docker Compose Setup

## Goal
Create Docker Compose configuration for one-command local deployment.

## Commit
```
feat(docker): compose-based local run
```

## Tasks

### 1. Create Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Set build-time environment variables
ARG PUBLIC_APP_MODE=local
ARG PUBLIC_BACKEND_URL=http://localhost:8000

ENV PUBLIC_APP_MODE=$PUBLIC_APP_MODE
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 4321

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
```

### 2. Update Astro Config for SSR
Update `frontend/astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
```

Add Node adapter:
```bash
cd frontend
npm install @astrojs/node
```

### 3. Update Backend Dockerfile
Update `backend/Dockerfile`:
```dockerfile
FROM python:3.14-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper model (optional, speeds up first request)
# Uncomment to bake model into image (larger image, faster startup)
# RUN python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')"

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4. Create Docker Compose File
Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        PUBLIC_APP_MODE: local
        PUBLIC_BACKEND_URL: http://localhost:8000
    ports:
      - "4321:4321"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - NODE_ENV=production

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - WHISPER_MODEL=small
    volumes:
      # Cache Whisper models between container restarts
      - whisper-models:/root/.cache/huggingface
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      start_period: 60s
      retries: 3

volumes:
  whisper-models:
```

### 5. Create .dockerignore Files
Create `frontend/.dockerignore`:
```
node_modules
dist
.astro
.env
.env.*
*.log
.git
.gitignore
```

Create `backend/.dockerignore`:
```
__pycache__
*.pyc
*.pyo
.env
.venv
venv
*.egg-info
.git
.gitignore
.pytest_cache
```

### 6. Add curl to Backend Image
Update `backend/Dockerfile` to include curl for healthcheck:
```dockerfile
FROM python:3.14-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ... rest of Dockerfile
```

## Expected Structure After This Phase
```
vocalize/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
└── ...
```

## Verification

### Build and Run
```bash
docker compose up --build
```

### Test Endpoints
```bash
# Frontend
curl http://localhost:4321

# Backend health
curl http://localhost:8000/api/health
```

### End-to-End Test
1. Open http://localhost:4321
2. Click "Start Recording"
3. Allow microphone permission
4. Speak something
5. Click "Stop Recording"
6. Wait for transcription
7. Verify transcript appears

### Cleanup
```bash
docker compose down
docker compose down -v  # Also remove volumes
```

## Verification Checklist
- [ ] `docker compose up --build` completes without errors
- [ ] Frontend accessible at http://localhost:4321
- [ ] Backend accessible at http://localhost:8000
- [ ] Recording works in browser
- [ ] Transcription returns results
- [ ] Container restart preserves downloaded models (volume)
- [ ] Health checks pass

## Notes
- Frontend uses Astro Node adapter for SSR
- Backend healthcheck ensures model loading before frontend starts
- Whisper models cached in Docker volume
- First transcription request downloads model (~500MB for "small")
- Use `WHISPER_MODEL=tiny` for faster downloads during testing

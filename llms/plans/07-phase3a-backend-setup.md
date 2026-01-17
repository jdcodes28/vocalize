# Phase 3a — Backend Setup (FastAPI)

## Goal
Initialize the FastAPI backend with project structure and health endpoint.

## Commit
```
chore(backend): init fastapi project
```

## Tasks

### 1. Create Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   └── main.py
├── requirements.txt
├── Dockerfile
└── .gitignore
```

### 2. Create Requirements File
Create `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
faster-whisper==1.0.1
```

### 3. Create Main Application
Create `backend/app/__init__.py`:
```python
# Backend application package
```

Create `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vocalize API",
    description="Local voice transcription using Whisper",
    version="1.0.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "http://localhost:3000",
        "http://127.0.0.1:4321",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
```

### 4. Create Backend .gitignore
Create `backend/.gitignore`:
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
.venv/
env/
.env

# IDE
.idea/
.vscode/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# Build
*.egg-info/
dist/
build/

# Whisper models (downloaded at runtime)
models/
```

### 5. Create Dockerfile
Create `backend/Dockerfile`:
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

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6. Test Locally (Optional)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then test:
```bash
curl http://localhost:8000/api/health
# Expected: {"status":"ok"}
```

## Expected Structure After This Phase
```
backend/
├── app/
│   ├── __init__.py
│   └── main.py
├── requirements.txt
├── Dockerfile
└── .gitignore
```

## Verification
- [ ] `uvicorn app.main:app` starts without errors
- [ ] `GET /api/health` returns `{"status": "ok"}`
- [ ] CORS headers present in response
- [ ] Dockerfile builds successfully

## Notes
- Using FastAPI 0.109.0 (stable)
- faster-whisper 1.0.1 includes ctranslate2
- ffmpeg is installed in Dockerfile for audio conversion
- CORS allows both localhost:4321 and 127.0.0.1 variants

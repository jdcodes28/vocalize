# Phase 3b — Transcription Endpoint

## Goal
Implement the `/api/transcribe` endpoint with audio conversion and Whisper transcription.

## Commit
```
feat(backend): local transcription endpoint via faster-whisper
```

## Tasks

### 1. Create Transcription Service
Create `backend/app/transcribe.py`:
```python
import asyncio
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from faster_whisper import WhisperModel

# Global lock to serialize transcription requests (MVP stability)
_transcription_lock = asyncio.Lock()

# Lazy-loaded model
_model: Optional[WhisperModel] = None
_model_name = os.getenv("WHISPER_MODEL", "small")


def get_model() -> WhisperModel:
    """Get or initialize the Whisper model."""
    global _model
    if _model is None:
        # Detect device: CUDA if available, else CPU
        device = "cuda" if _cuda_available() else "cpu"
        compute_type = "float16" if device == "cuda" else "int8"

        _model = WhisperModel(
            _model_name,
            device=device,
            compute_type=compute_type,
        )
    return _model


def _cuda_available() -> bool:
    """Check if CUDA is available."""
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False


def convert_to_wav(input_path: Path, output_path: Path) -> None:
    """Convert audio file to 16kHz mono WAV using ffmpeg."""
    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output
        "-i", str(input_path),
        "-ac", "1",  # Mono
        "-ar", "16000",  # 16kHz sample rate
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg conversion failed: {result.stderr}")


async def transcribe_audio(audio_bytes: bytes, filename: str) -> dict:
    """
    Transcribe audio bytes to text.

    Args:
        audio_bytes: Raw audio file bytes
        filename: Original filename (used for extension detection)

    Returns:
        Dict with transcription results
    """
    async with _transcription_lock:
        return await asyncio.to_thread(_transcribe_sync, audio_bytes, filename)


def _transcribe_sync(audio_bytes: bytes, filename: str) -> dict:
    """Synchronous transcription (runs in thread pool)."""
    # Get file extension
    ext = Path(filename).suffix or ".webm"

    # Create temp files
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as input_file:
        input_path = Path(input_file.name)
        input_file.write(audio_bytes)

    wav_path = input_path.with_suffix(".wav")

    try:
        # Convert to WAV
        convert_to_wav(input_path, wav_path)

        # Get audio duration
        duration = _get_audio_duration(wav_path)

        # Transcribe
        model = get_model()
        segments, info = model.transcribe(
            str(wav_path),
            beam_size=5,
            vad_filter=True,
        )

        # Collect segments
        segment_list = []
        full_text_parts = []

        for segment in segments:
            segment_list.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
            })
            full_text_parts.append(segment.text.strip())

        full_text = " ".join(full_text_parts)

        return {
            "text": full_text,
            "language": info.language,
            "duration_sec": round(duration, 2),
            "segments": segment_list,
            "model": _model_name,
            "device": "cuda" if _cuda_available() else "cpu",
        }

    finally:
        # Cleanup temp files
        input_path.unlink(missing_ok=True)
        wav_path.unlink(missing_ok=True)


def _get_audio_duration(wav_path: Path) -> float:
    """Get audio duration using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(wav_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return 0.0
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0
```

### 2. Create API Models
Create `backend/app/models.py`:
```python
from typing import List, Optional
from pydantic import BaseModel


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptResponse(BaseModel):
    text: str
    language: str
    duration_sec: float
    segments: Optional[List[TranscriptSegment]] = None
    model: str
    device: str


class ErrorResponse(BaseModel):
    detail: str
```

### 3. Update Main Application
Update `backend/app/main.py`:
```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import TranscriptResponse, ErrorResponse
from .transcribe import transcribe_audio

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


@app.post(
    "/api/transcribe",
    response_model=TranscriptResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file"},
        500: {"model": ErrorResponse, "description": "Transcription error"},
    },
)
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe an audio file using Whisper.

    Accepts any audio format supported by ffmpeg.
    Returns transcribed text with metadata.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Transcribe
    try:
        result = await transcribe_audio(content, file.filename)
        return TranscriptResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
```

### 4. Update Requirements
Update `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
faster-whisper==1.0.1
pydantic>=2.0.0
```

## Expected Structure After This Phase
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   └── transcribe.py
├── requirements.txt
├── Dockerfile
└── .gitignore
```

## Verification
- [ ] `POST /api/transcribe` with audio file returns transcript
- [ ] Response includes all fields: text, language, duration_sec, model, device
- [ ] Invalid file returns 400 error
- [ ] Temp files are cleaned up after transcription
- [ ] Concurrent requests are serialized (lock works)

## Testing Commands
```bash
# Test with a sample audio file
curl -X POST "http://localhost:8000/api/transcribe" \
  -H "accept: application/json" \
  -F "file=@sample.webm"
```

## Notes
- Model is lazy-loaded on first request
- Uses `asyncio.Lock` to prevent concurrent transcriptions (OOM protection)
- ffmpeg handles format conversion transparently
- VAD filter removes silence for faster processing
- WHISPER_MODEL env var can override default model size

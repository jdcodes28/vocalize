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

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

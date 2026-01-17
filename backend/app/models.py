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

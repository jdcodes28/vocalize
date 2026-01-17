import { config } from "./config";
import type { TranscriptResult } from "./recorder-types";

export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptResult> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${config.backendUrl}/api/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}


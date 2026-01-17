import { useState, useRef, useCallback } from "react";
import type { RecorderState, RecorderError, TranscriptResult } from "@/lib/recorder-types";
import { transcribeAudio } from "@/lib/api";

function getSupportedMimeType(): string | null {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript(null);

    // Clean up previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error("No supported audio format found");
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Upload for transcription
        setState("processing");
        try {
          const result = await transcribeAudio(blob);
          setTranscript(result);
          setState("done");
        } catch (err) {
          setError({
            type: "backend_error",
            message: err instanceof Error ? err.message : "Transcription failed",
          });
          setState("error");
        }
      };

      mediaRecorder.start();
      setState("recording");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        setError({ type: "mic_permission", message: "Microphone permission denied" });
      } else if (errorMessage.includes("NotFoundError")) {
        setError({ type: "mic_not_found", message: "No microphone found" });
      } else {
        setError({ type: "backend_error", message: errorMessage });
      }
      setState("error");
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setState("idle");
    setError(null);
    setTranscript(null);
    setAudioUrl(null);
  }, [audioUrl]);

  return {
    state,
    error,
    transcript,
    audioUrl,
    startRecording,
    stopRecording,
    reset,
  };
}

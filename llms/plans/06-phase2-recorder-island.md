# Phase 2 — Recorder Island (Local Mode)

## Goal
Implement full recording functionality in local mode with state machine, MediaRecorder, and backend integration.

## Commit
```
feat(frontend): local-mode recording + transcript rendering
```

## Tasks

### 1. Create Recorder State Types
Create `src/lib/recorder-types.ts`:
```typescript
export type RecorderState =
  | "idle"
  | "recording"
  | "processing"
  | "done"
  | "error";

export interface TranscriptResult {
  text: string;
  language: string;
  duration_sec: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  model: string;
  device: string;
}

export interface RecorderError {
  type: "mic_permission" | "mic_not_found" | "upload_failed" | "backend_error";
  message: string;
}
```

### 2. Create API Client Module
Create `src/lib/api.ts`:
```typescript
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

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.backendUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

### 3. Create useRecorder Hook
Create `src/hooks/useRecorder.ts`:
```typescript
import { useState, useRef, useCallback } from "react";
import type { RecorderState, RecorderError, TranscriptResult } from "../lib/recorder-types";
import { transcribeAudio } from "../lib/api";

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
  const streamRef = useRef<MediaStream | null>(null);

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
      streamRef.current = stream;

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
```

### 4. Create RecorderIsland Component
Create `src/components/RecorderIsland.tsx`:
```tsx
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRecorder } from "../hooks/useRecorder";
import { isPreviewMode } from "../lib/config";

const EXAMPLE_TRANSCRIPT = `Hello and welcome to the demo. This is an example of what transcribed text would look like when using the local version with Docker Compose. The actual transcription uses OpenAI's Whisper model running entirely on your machine.`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy to Clipboard"}
    </Button>
  );
}

function StatusLine({ state, error }: { state: string; error: { message: string } | null }) {
  if (error) {
    return <p className="text-rose-400 text-sm">{error.message}</p>;
  }

  const messages: Record<string, { text: string; color: string }> = {
    idle: { text: "Ready to record", color: "text-slate-400" },
    recording: { text: "Recording...", color: "text-emerald-400" },
    processing: { text: "Transcribing...", color: "text-sky-400" },
    done: { text: "Transcription complete", color: "text-emerald-400" },
    error: { text: "An error occurred", color: "text-rose-400" },
  };

  const { text, color } = messages[state] ?? messages.idle;
  return <p className={`${color} text-sm`}>{text}</p>;
}

export function RecorderIsland() {
  const { state, error, transcript, audioUrl, startRecording, stopRecording, reset } = useRecorder();

  // Preview mode: static UI
  if (isPreviewMode) {
    return (
      <RecorderCardShell>
        <div className="text-center">
          <p className="text-amber-300 text-sm">Preview mode — recording disabled</p>
        </div>
        <div className="flex justify-center">
          <Button size="lg" disabled className="px-8 py-6 text-lg">
            Recording Requires Local Setup
          </Button>
        </div>
        <p className="text-center text-xs text-slate-500">
          See instructions below to run locally
        </p>
        <TranscriptArea
          value={EXAMPLE_TRANSCRIPT}
          isExample
          showCopy={false}
        />
      </RecorderCardShell>
    );
  }

  // Local mode: interactive
  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const showPlayback = audioUrl && (state === "done" || state === "processing");
  const transcriptText = transcript?.text ?? "";

  return (
    <RecorderCardShell>
      <div className="text-center">
        <StatusLine state={state} error={error} />
      </div>

      <div className="flex justify-center gap-3">
        {state === "idle" || state === "error" || state === "done" ? (
          <Button
            size="lg"
            onClick={startRecording}
            className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {state === "done" ? "Record Again" : "Start Recording"}
          </Button>
        ) : isRecording ? (
          <Button
            size="lg"
            onClick={stopRecording}
            variant="destructive"
            className="px-8 py-6 text-lg"
          >
            Stop Recording
          </Button>
        ) : (
          <Button size="lg" disabled className="px-8 py-6 text-lg">
            Processing...
          </Button>
        )}

        {state === "done" && (
          <Button size="lg" variant="outline" onClick={reset} className="px-6 py-6">
            Clear
          </Button>
        )}
      </div>

      {/* Playback */}
      {showPlayback && (
        <div className="flex justify-center">
          <audio src={audioUrl} controls className="w-full max-w-md" />
        </div>
      )}

      {/* Transcript */}
      <TranscriptArea
        value={transcriptText}
        isExample={false}
        showCopy={state === "done" && transcriptText.length > 0}
        isLoading={isProcessing}
      />
    </RecorderCardShell>
  );
}

function RecorderCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-blue-500/20 rounded-xl blur-xl" />
      <Card className="relative bg-slate-900/60 border-white/10 backdrop-blur rounded-xl shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_60px_-20px_rgba(59,130,246,0.35)]">
        <CardContent className="pt-6 space-y-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

interface TranscriptAreaProps {
  value: string;
  isExample: boolean;
  showCopy: boolean;
  isLoading?: boolean;
}

function TranscriptArea({ value, isExample, showCopy, isLoading }: TranscriptAreaProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Transcript</label>
        {isExample && (
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
            Example output
          </span>
        )}
        {isLoading && (
          <span className="text-xs text-sky-400 animate-pulse">
            Transcribing...
          </span>
        )}
      </div>
      <Textarea
        readOnly
        value={value}
        placeholder="Transcribed text will appear here..."
        className="min-h-[120px] bg-slate-800/50 border-white/10 text-slate-200 resize-none"
      />
      {showCopy && <CopyButton text={value} />}
    </div>
  );
}
```

### 5. Update Page to Use RecorderIsland
Update `src/pages/index.astro`:
```astro
---
import '../styles/global.css';
import { Header } from '../components/Header';
import { RecorderIsland } from '../components/RecorderIsland';
import { CTABlock } from '../components/CTABlock';
import { isPreviewMode } from '../lib/config';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content="Local voice transcription using Whisper. Run with Docker Compose." />
    <title>Vocalize</title>
  </head>
  <body>
    <div class="min-h-screen">
      <main class="container mx-auto px-4 py-8 max-w-2xl">
        <Header client:load />

        <div class="space-y-8">
          {isPreviewMode && <CTABlock client:load />}
          <RecorderIsland client:load />
          {!isPreviewMode && <CTABlock client:load />}
        </div>
      </main>
    </div>
  </body>
</html>
```

### 6. Delete Old RecorderCard
Remove `src/components/RecorderCard.tsx` (replaced by RecorderIsland).

## Expected Structure After This Phase
```
frontend/src/
├── components/
│   ├── ui/
│   ├── CTABlock.tsx
│   ├── Header.tsx
│   ├── ModeBadge.tsx
│   └── RecorderIsland.tsx
├── hooks/
│   └── useRecorder.ts
├── lib/
│   ├── api.ts
│   ├── config.ts
│   ├── recorder-types.ts
│   └── utils.ts
├── pages/
│   └── index.astro
└── styles/
    └── global.css
```

## Verification
### Preview Mode
- [ ] No mic permission request on page load
- [ ] No mic permission request on button click (disabled)
- [ ] No network requests to backend
- [ ] Example transcript displayed

### Local Mode
- [ ] Click "Start Recording" prompts for mic permission
- [ ] Recording state shows "Recording..." status
- [ ] Click "Stop Recording" triggers upload
- [ ] Audio playback controls appear
- [ ] Transcript displays after processing
- [ ] Copy button works
- [ ] Clear button resets state
- [ ] Error states display correctly

## Notes
- The hook handles MediaRecorder lifecycle
- Audio is uploaded as webm/opus (most compatible)
- Backend errors are caught and displayed
- Clean up object URLs to prevent memory leaks

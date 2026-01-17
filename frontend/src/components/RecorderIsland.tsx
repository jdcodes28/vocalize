import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRecorder } from "@/hooks/useRecorder";
import { isPreviewMode } from "@/lib/config";

const EXAMPLE_TRANSCRIPT = `This is an example of transcribed text. When running locally, Vocalize uses OpenAI's Whisper model to transcribe your audio entirely on your machine. No data is sent to any external servers.`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy to Clipboard"}
    </Button>
  );
}

function StatusLine({
  state,
  error,
}: {
  state: string;
  error: { message: string } | null;
}) {
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

function RecorderCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-linear-to-r from-blue-500/20 via-blue-600/10 to-blue-500/20 rounded-xl blur-xl" />
      <Card className="relative bg-slate-900/60 border-white/10 backdrop-blur rounded-xl shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_60px_-20px_rgba(59,130,246,0.35)]">
        <CardContent className="space-y-8">{children}</CardContent>
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

function TranscriptArea({
  value,
  isExample,
  showCopy,
  isLoading,
}: TranscriptAreaProps) {
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

export function RecorderIsland() {
  const {
    state,
    error,
    transcript,
    audioUrl,
    startRecording,
    stopRecording,
    reset,
  } = useRecorder();

  // Preview mode: static UI
  if (isPreviewMode) {
    return (
      <RecorderCardShell>
        <div className="text-center">
          <p className="text-amber-300 text-sm">
            Preview mode — recording disabled
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled
            className="px-8 py-6 text-lg w-full sm:w-auto h-auto whitespace-normal text-center"
          >
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
        <StatusLine
          state={state}
          error={error}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {state === "idle" || state === "error" || state === "done" ? (
          <Button
            size="lg"
            onClick={startRecording}
            className="px-8 py-6 text-lg w-full sm:w-auto"
          >
            {state === "done" ? "Record Again" : "Start Recording"}
          </Button>
        ) : isRecording ? (
          <Button
            size="lg"
            onClick={stopRecording}
            variant="destructive"
            className="px-8 py-6 text-lg w-full sm:w-auto"
          >
            Stop Recording
          </Button>
        ) : (
          <Button
            size="lg"
            disabled
            className="px-8 py-6 text-lg w-full sm:w-auto"
          >
            Processing...
          </Button>
        )}

        {state === "done" && (
          <Button
            size="lg"
            variant="outline"
            onClick={reset}
            className="px-6 py-6 w-full sm:w-auto"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Playback */}
      {showPlayback && (
        <div className="flex justify-center">
          <audio
            src={audioUrl}
            controls
            className="w-full max-w-md"
          />
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

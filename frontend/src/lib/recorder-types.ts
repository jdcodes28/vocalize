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

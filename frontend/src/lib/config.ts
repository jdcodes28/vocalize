/**
 * App configuration based on environment variables.
 *
 * PUBLIC_APP_MODE:
 *   - "preview": UI-only mode for hosted demo (no mic, no backend)
 *   - "local": Full functionality with recording and transcription
 *
 * PUBLIC_BACKEND_URL:
 *   - Backend API base URL (only used in local mode)
 */

export type AppMode = "preview" | "local";

export const config = {
  mode: (import.meta.env.PUBLIC_APP_MODE ?? "local") as AppMode,
  backendUrl: import.meta.env.PUBLIC_BACKEND_URL ?? "http://localhost:8000",
} as const;

export const isPreviewMode = config.mode === "preview";

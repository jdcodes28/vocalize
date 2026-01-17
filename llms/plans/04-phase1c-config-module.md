# Phase 1c — Environment Config Module

## Goal
Create a config module that handles `PUBLIC_APP_MODE` and `PUBLIC_BACKEND_URL` environment variables.

## Commit
```
feat(frontend): add app mode config
```

## Tasks

### 1. Create Config Module
Create `src/lib/config.ts`:
```typescript
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
export const isLocalMode = config.mode === "local";
```

### 2. Create Environment Type Definitions
Create `src/env.d.ts` (or update if exists):
```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_MODE?: "preview" | "local";
  readonly PUBLIC_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 3. Create Example Environment File
Create `frontend/.env.example`:
```bash
# App Mode: "preview" (UI-only) or "local" (full functionality)
PUBLIC_APP_MODE=local

# Backend URL (only used in local mode)
PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Add .env to .gitignore
Create or update `frontend/.gitignore`:
```
# Environment files
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build output
dist/

# Astro
.astro/
```

### 5. Create Mode Badge Component
Create `src/components/ModeBadge.tsx`:
```tsx
import { isPreviewMode } from "../lib/config";

export function ModeBadge() {
  if (!isPreviewMode) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
      Preview Mode
    </span>
  );
}
```

### 6. Test Config in Component
Update `src/components/TestButton.tsx`:
```tsx
import { Button } from "./ui/button";
import { config, isPreviewMode } from "../lib/config";

export function TestButton() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">
        Mode: {config.mode} | Backend: {config.backendUrl}
      </p>
      <Button
        onClick={() => alert(`Mode: ${config.mode}`)}
        disabled={isPreviewMode}
      >
        {isPreviewMode ? "Recording Disabled" : "Test Button"}
      </Button>
    </div>
  );
}
```

## Expected Files After This Phase
```
frontend/
├── src/
│   ├── components/
│   │   ├── ModeBadge.tsx
│   │   └── TestButton.tsx (updated)
│   ├── lib/
│   │   ├── config.ts
│   │   └── utils.ts
│   └── env.d.ts
├── .env.example
└── .gitignore
```

## Verification
- [ ] `config.mode` returns "local" by default
- [ ] `config.backendUrl` returns "http://localhost:8000" by default
- [ ] Setting `PUBLIC_APP_MODE=preview` in `.env` changes behavior
- [ ] Button is disabled in preview mode
- [ ] TypeScript recognizes environment variable types

## Notes
- Astro uses `PUBLIC_` prefix for client-exposed env vars
- Config is evaluated at build time, not runtime
- Preview mode should be set during Vercel build

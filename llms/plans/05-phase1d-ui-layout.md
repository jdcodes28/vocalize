# Phase 1d — UI Layout Components (Preview Mode)

## Goal
Build the complete UI layout per DESIGN.md, working in preview mode.

## Commit
```
feat(frontend): preview-mode UI shell with blue theme
```

## Tasks

### 1. Create Header Component
Create `src/components/Header.tsx`:
```tsx
import { ModeBadge } from "./ModeBadge";

export function Header() {
  return (
    <header className="text-center py-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-slate-50">
          Vocalize
        </h1>
        <ModeBadge />
      </div>
      <p className="text-slate-300 max-w-md mx-auto">
        Run locally with Docker Compose. Hosted preview is UI-only.
      </p>
    </header>
  );
}
```

### 2. Create CTA Block Component
Create `src/components/CTABlock.tsx`:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CTABlock() {
  const commands = [
    "git clone <repo-url>",
    "cd vocalize",
    "docker compose up --build",
  ];

  return (
    <Card className="bg-slate-900/60 border-white/10 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-50 flex items-center gap-2">
          <span className="text-blue-400">→</span>
          Try it locally
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {commands.map((cmd, i) => (
          <code
            key={i}
            className="block bg-slate-800/80 px-3 py-2 rounded text-sm text-slate-200 font-mono"
          >
            {cmd}
          </code>
        ))}
        <p className="text-xs text-slate-400 pt-2">
          Then open{" "}
          <code className="text-sky-400">http://localhost:4321</code>
        </p>
      </CardContent>
    </Card>
  );
}
```

### 3. Create Recorder Card Shell (Preview Version)
Create `src/components/RecorderCard.tsx`:
```tsx
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { isPreviewMode } from "../lib/config";

const EXAMPLE_TRANSCRIPT = `Hello and welcome to the demo. This is an example of what transcribed text would look like when using the local version with Docker Compose. The actual transcription uses OpenAI's Whisper model running entirely on your machine.`;

export function RecorderCard() {
  return (
    <div className="relative">
      {/* Glow effect wrapper */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-blue-500/20 rounded-xl blur-xl" />

      <Card className="relative bg-slate-900/60 border-white/10 backdrop-blur rounded-xl shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_60px_-20px_rgba(59,130,246,0.35)]">
        <CardContent className="pt-6 space-y-6">
          {/* Status line */}
          <div className="text-center">
            {isPreviewMode ? (
              <p className="text-amber-300 text-sm">
                Preview mode — recording disabled
              </p>
            ) : (
              <p className="text-slate-400 text-sm">
                Ready to record
              </p>
            )}
          </div>

          {/* Record button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              disabled={isPreviewMode}
              className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreviewMode ? "Recording Requires Local Setup" : "Start Recording"}
            </Button>
          </div>

          {/* Helper text for preview mode */}
          {isPreviewMode && (
            <p className="text-center text-xs text-slate-500">
              See instructions below to run locally
            </p>
          )}

          {/* Transcript area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Transcript
              </label>
              {isPreviewMode && (
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                  Example output
                </span>
              )}
            </div>
            <Textarea
              readOnly
              value={isPreviewMode ? EXAMPLE_TRANSCRIPT : ""}
              placeholder="Transcribed text will appear here..."
              className="min-h-[120px] bg-slate-800/50 border-white/10 text-slate-200 resize-none"
            />
            {!isPreviewMode && (
              <Button variant="outline" size="sm" className="w-full">
                Copy to Clipboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Update Main Page Layout
Update `src/pages/index.astro`:
```astro
---
import '../styles/global.css';
import { Header } from '../components/Header';
import { RecorderCard } from '../components/RecorderCard';
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
          <!-- CTA Block first in preview mode (above fold) -->
          {isPreviewMode && (
            <CTABlock client:load />
          )}

          <RecorderCard client:load />

          <!-- CTA Block after recorder in local mode -->
          {!isPreviewMode && (
            <CTABlock client:load />
          )}
        </div>
      </main>
    </div>
  </body>
</html>
```

### 5. Update Global Styles
Update `src/styles/global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 min-h-screen text-slate-50 antialiased;
  }
}

@layer components {
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900;
  }
}
```

### 6. Remove Test Components
Delete `src/components/TestButton.tsx` (no longer needed).

## Expected Structure After This Phase
```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── textarea.tsx
│   ├── CTABlock.tsx
│   ├── Header.tsx
│   ├── ModeBadge.tsx
│   └── RecorderCard.tsx
├── lib/
│   ├── config.ts
│   └── utils.ts
├── pages/
│   └── index.astro
├── styles/
│   └── global.css
└── env.d.ts
```

## Verification
- [ ] Page displays header with title and subtitle
- [ ] Recorder card has blue glow effect
- [ ] In preview mode: button disabled, example transcript shown
- [ ] In preview mode: CTA block appears above recorder
- [ ] In local mode: button enabled, empty transcript area
- [ ] All colors match DESIGN.md specifications
- [ ] No TypeScript or console errors

## Notes
- Components use `client:load` for React hydration
- Preview mode logic is at build time (static)
- Glow effect uses absolute positioning with blur
- This completes the Phase 1 commit from AGENTS.md

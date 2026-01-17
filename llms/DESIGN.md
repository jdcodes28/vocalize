# DESIGN.md — Blue Theme UI/UX (shadcn/ui + Tailwind)

## Theme Goals
- Blue-forward visual identity: communication/clarity vibe
- Strong contrast and readability
- “Preview mode” should look intentionally gated, not broken

## Color Direction (Tailwind tokens)
Background:
- Page: blue gradient, dark-to-slightly-lighter
  - `bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950`
Accents:
- Primary: `blue-500/600` (buttons, focus rings)
- Secondary: `sky-400` (highlights)
Surfaces:
- Cards: `bg-slate-900/60` with blur
- Borders: `border-white/10`
Text:
- Primary: `text-slate-50`
- Muted: `text-slate-300`
Status colors:
- Success: `text-emerald-400`
- Warning: `text-amber-300`
- Error: `text-rose-400`

## Layout
### Header
- Title: “Vocalize”
- Subtitle: “Run locally with Docker Compose. Hosted preview is UI-only.”

### Main Card (Recorder)
Card styling:
- `rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur`
- Subtle glow:
  - wrapper with `shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_60px_-20px_rgba(59,130,246,0.35)]`

Controls:
- Primary button (Record / Stop):
  - Normal: blue gradient button
  - Disabled (Preview): still styled, but with disabled opacity + cursor
- Status line:
  - Preview: “Preview mode (recording disabled)”
  - Local: Idle / Recording / Processing / Error

Playback:
- Hidden entirely in Preview Mode
- Visible after stop in Local Mode

Transcript:
- Preview: example transcript block with “Example output” label
- Local: read-only textarea + copy button

### CTA Block (Above the fold)
- “Try it locally” panel with copy-pastable commands:
  - `git clone ...`
  - `docker compose up --build`
  - open `http://localhost:4321`

## Preview Mode UX Rules
- Never ask for mic permission.
- Record button disabled + helper text:
  - “Recording requires running locally.”
- Transcript shows a short realistic example labeled clearly.

## Micro-interactions
- Spinner only during processing
- Subtle focus rings:
  - `focus-visible:ring-2 focus-visible:ring-blue-500/60`
- Button hover:
  - Slight brightness increase (no flashy animations)

## Accessibility
- Ensure contrast meets WCAG-ish expectations on dark background
- Buttons/inputs must have visible focus states
- Status text should not rely on color alone (include words/icons)

# Phase 1b — Add shadcn/ui + React Integration

## Goal
Add React as an Astro integration and set up shadcn/ui for component library.

## Commit
```
chore(frontend): add shadcn-ui and react
```

## Tasks

### 1. Add React Integration to Astro
```bash
cd frontend
npx astro add react
```

This will:
- Install `@astrojs/react`, `react`, `react-dom`
- Update `astro.config.mjs`

### 2. Initialize shadcn/ui
```bash
npx shadcn@latest init
```

Choose options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

This creates:
- `components.json`
- Updates `tailwind.config.mjs` with shadcn paths
- Creates `src/lib/utils.ts` with `cn()` helper

### 3. Update Tailwind Config for shadcn
The shadcn init should handle this, but verify `tailwind.config.mjs` includes:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      // shadcn color tokens will be here
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4. Add Required shadcn Components
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add textarea
```

These create files in `src/components/ui/`:
- `button.tsx`
- `card.tsx`
- `textarea.tsx`

### 5. Customize Button Colors for Blue Theme
Update `src/components/ui/button.tsx` default variant to use blue:
```tsx
// In buttonVariants, update the default variant:
default: "bg-blue-600 text-slate-50 hover:bg-blue-700 shadow-sm",
```

### 6. Test React Integration
Create `src/components/TestButton.tsx`:
```tsx
import { Button } from "./ui/button";

export function TestButton() {
  return (
    <Button onClick={() => alert("React works!")}>
      Test Button
    </Button>
  );
}
```

Update `index.astro` to use it:
```astro
---
import '../styles/global.css';
import { TestButton } from '../components/TestButton';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Vocalize</title>
  </head>
  <body>
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold">Vocalize</h1>
      <TestButton client:load />
    </main>
  </body>
</html>
```

## Expected Structure After This Phase
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── textarea.tsx
│   │   └── TestButton.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── components.json
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## Verification
- [ ] React component renders with `client:load`
- [ ] Button click triggers alert
- [ ] shadcn button has blue styling
- [ ] No hydration errors in console

## Notes
- `client:load` directive tells Astro to hydrate the React component
- shadcn components are copied to your codebase (not imported from node_modules)
- The TestButton is temporary; will be removed in the next phase

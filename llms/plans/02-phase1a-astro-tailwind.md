# Phase 1a — Initialize Astro + Tailwind

## Goal
Set up the Astro project with Tailwind CSS for styling.

## Commit
```
chore(frontend): init astro with tailwind
```

## Tasks

### 1. Initialize Astro Project
```bash
cd frontend
npm create astro@latest . -- --template minimal --install --no-git
```

Choose options:
- Template: minimal
- Install dependencies: yes
- TypeScript: strict
- No git init (already in repo)

### 2. Add Tailwind CSS Integration
```bash
npx astro add tailwind
```

This will:
- Install `@astrojs/tailwind` and `tailwindcss`
- Create `tailwind.config.mjs`
- Update `astro.config.mjs`

### 3. Configure Tailwind for Blue Theme
Update `tailwind.config.mjs`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Create Base Styles
Create `src/styles/global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 min-h-screen text-slate-50;
  }
}
```

### 5. Create Basic Layout
Update `src/pages/index.astro` to use the global styles:
```astro
---
import '../styles/global.css';
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
      <p class="text-slate-300">Setup in progress...</p>
    </main>
  </body>
</html>
```

## Expected Structure After This Phase
```
frontend/
├── src/
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── public/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── package-lock.json
```

## Verification
- [ ] `npm run dev` starts the dev server
- [ ] Page loads with blue gradient background
- [ ] No console errors
- [ ] Tailwind classes work

## Notes
- Astro minimal template has no extra dependencies
- Tailwind integration handles PostCSS config automatically
- Global styles establish the dark blue theme from DESIGN.md

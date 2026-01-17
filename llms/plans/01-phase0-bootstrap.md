# Phase 0 — Repo Bootstrap

## Goal
Create the basic folder structure and Nix shell for reproducible development.

## Commit
```
chore: bootstrap repo layout with nix shell
```

## Tasks

### 1. Create Nix Shell Configuration
Create `shell.nix` in project root:
```nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "vocalize-dev";

  buildInputs = with pkgs; [
    # Node.js for frontend (latest LTS, Vercel compatible)
    nodejs_24
    nodePackages.npm

    # Python for backend (latest stable)
    python314
    python314Packages.pip
    python314Packages.virtualenv

    # Audio processing
    ffmpeg

    # Utilities
    curl
    jq
  ];

  shellHook = ''
    echo "🎙️ Vocalize development environment"
    echo ""
    echo "Node.js: $(node --version)"
    echo "Python:  $(python --version)"
    echo "ffmpeg:  $(ffmpeg -version | head -n1)"
    echo ""
    echo "Commands:"
    echo "  cd frontend && npm install && npm run dev   # Start frontend"
    echo "  cd backend && ./setup-venv.sh && ./run.sh   # Start backend"
    echo ""

    # Set up Python virtual env path
    export VENV_DIR="$PWD/backend/.venv"

    # Ensure npm uses local node_modules
    export PATH="$PWD/frontend/node_modules/.bin:$PATH"
  '';
}
```

### 2. Create Backend Helper Scripts
Create `backend/setup-venv.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "✓ Backend setup complete"
echo "Run: source .venv/bin/activate && uvicorn app.main:app --reload"
```

Create `backend/run.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Run ./setup-venv.sh first."
    exit 1
fi

source .venv/bin/activate
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Create Frontend Directory
```bash
mkdir -p frontend
```

### 4. Create Backend Directory
```bash
mkdir -p backend
```

### 5. Update .gitignore
Create root `.gitignore`:
```
# Nix
result
.direnv/

# Python
__pycache__/
*.py[cod]
.venv/
venv/
*.egg-info/

# Node
node_modules/
.npm/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local
```

## Expected Structure After This Phase
```
vocalize/
├── shell.nix
├── .gitignore
├── frontend/
│   └── .gitkeep
├── backend/
│   ├── setup-venv.sh
│   ├── run.sh
│   └── .gitkeep
├── llms/
│   └── ...
└── CLAUDE.md
```

## Verification
- [ ] `nix-shell` enters the development environment
- [ ] `node --version` shows v24.x
- [ ] `python --version` shows 3.14.x
- [ ] `ffmpeg -version` works
- [ ] Git commit is clean and atomic

## Development Workflow
All development commands should be run inside the Nix shell:
```bash
# Enter the development environment
nix-shell

# Frontend development
cd frontend
npm install
npm run dev

# Backend development (in another terminal, also in nix-shell)
cd backend
./setup-venv.sh
./run.sh
```

## Notes
- Using Node.js 24 LTS "Krypton" (latest LTS, Vercel compatible)
- Using Python 3.14 (latest stable release)
- Python packages installed via pip in a virtualenv (faster-whisper has complex deps)
- ffmpeg available system-wide for audio conversion
- Helper scripts simplify backend setup

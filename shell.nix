{ pkgs ? import <nixpkgs> {} }:

let
  # FHS environment for Python with native dependencies
  pythonEnv = pkgs.buildFHSEnv {
    name = "vocalize-python";
    targetPkgs = pkgs: with pkgs; [
      python312
      python312Packages.pip
      python312Packages.virtualenv
      ffmpeg
      stdenv.cc.cc.lib
      zlib
      libGL
    ];
    runScript = "bash";
  };
in
pkgs.mkShell {
  name = "vocalize-dev";

  buildInputs = with pkgs; [
    # Node.js for frontend
    nodejs_24
    nodePackages.npm

    # FHS Python environment for backend
    pythonEnv

    # Audio processing (for direct use)
    ffmpeg

    # Utilities
    curl
    jq
  ];

  shellHook = ''
    echo "🎙️ Vocalize development environment"
    echo ""
    echo "Node.js: $(node --version)"
    echo "ffmpeg:  $(ffmpeg -version 2>&1 | head -n1)"
    echo ""
    echo "Commands:"
    echo "  dev                         # Start frontend + backend"
    echo "  docker compose up --build   # Full Docker stack"
    echo ""

    # Ensure npm uses local node_modules
    export PATH="$PWD/frontend/node_modules/.bin:$PATH"

    # Dev command
    dev() {
      $PWD/scripts/dev.sh
    }
    export -f dev
  '';
}

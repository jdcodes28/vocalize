/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_MODE?: "preview" | "local";
  readonly PUBLIC_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

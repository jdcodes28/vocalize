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
        Local voice transcription powered by Whisper
      </p>
    </header>
  );
}

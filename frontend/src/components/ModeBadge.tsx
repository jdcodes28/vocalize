import { isPreviewMode } from "@/lib/config";

export function ModeBadge() {
  if (!isPreviewMode) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
      Preview Mode
    </span>
  );
}

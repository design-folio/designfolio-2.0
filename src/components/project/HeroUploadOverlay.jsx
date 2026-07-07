import { Upload } from "lucide-react";

// Hover "Change photo" overlay + hidden file input, shared by both hero views.
// Relies on a `group/thumb` ancestor for the hover reveal. Editor-only —
// callers gate rendering on `isEditable`.
export default function HeroUploadOverlay({ inputRef, onFile }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-all group-hover/thumb:bg-black/25">
        <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover/thumb:opacity-100">
          <Upload size={11} /> Change photo
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </>
  );
}

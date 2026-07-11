import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Shared fullscreen image popup for section images in preview/public modes.
export default function ImageLightbox({ src, onClose }) {
  if (!src || typeof document === "undefined") return null;

  return createPortal(
    <button
      type="button"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 outline-none"
      onClick={onClose}
      aria-label="Close fullscreen image"
    >
      <img
        src={src}
        alt="Fullscreen"
        className="max-h-full max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <span className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
        <X className="h-6 w-6" />
      </span>
    </button>,
    document.body
  );
}

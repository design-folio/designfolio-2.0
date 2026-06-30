import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

const SECTION_GROUPS = [
  {
    label: "Text",
    types: [
      { key: "freeform", label: "Freeform" },
      { key: "text-split", label: "Text Split" },
      { key: "text-3col", label: "3 Columns" },
      { key: "text-highlights", label: "Highlights" },
      { key: "text-accordion", label: "Accordion" },
    ],
  },
  {
    label: "Image",
    types: [
      { key: "image-grid", label: "Image Grid" },
      { key: "image-text", label: "Image + Text" },
    ],
  },
  {
    label: "Gallery",
    types: [
      { key: "gallery-carousel", label: "Carousel" },
      { key: "gallery-scroll", label: "Scroll Gallery" },
    ],
  },
  {
    label: "Embed",
    types: [
      { key: "embed-figma", label: "Figma" },
      { key: "embed-youtube", label: "YouTube" },
      { key: "embed-code", label: "Code" },
    ],
  },
];

function SectionPreview({ type }) {
  switch (type) {
    case "freeform":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="4" y="6" width="30" height="4" rx="1.5" fill="currentColor" opacity="0.4" />
          <rect x="4" y="14" width="52" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="4" y="20" width="44" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="4" y="26" width="52" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="4" y="32" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case "text-split":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          {[0, 1].map((i) => (
            <g key={i}>
              <rect
                x={4 + i * 30}
                y="6"
                width="22"
                height="4"
                rx="1.5"
                fill="currentColor"
                opacity="0.4"
              />
              <rect
                x={4 + i * 30}
                y="14"
                width="22"
                height="3"
                rx="1.5"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x={4 + i * 30}
                y="20"
                width="18"
                height="3"
                rx="1.5"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x={4 + i * 30}
                y="26"
                width="22"
                height="3"
                rx="1.5"
                fill="currentColor"
                opacity="0.2"
              />
            </g>
          ))}
        </svg>
      );
    case "text-3col":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={4 + i * 19}
                y="6"
                width="14"
                height="3"
                rx="1"
                fill="currentColor"
                opacity="0.4"
              />
              <rect
                x={4 + i * 19}
                y="13"
                width="14"
                height="2.5"
                rx="1"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x={4 + i * 19}
                y="18"
                width="10"
                height="2.5"
                rx="1"
                fill="currentColor"
                opacity="0.2"
              />
              <rect
                x={4 + i * 19}
                y="23"
                width="14"
                height="2.5"
                rx="1"
                fill="currentColor"
                opacity="0.2"
              />
            </g>
          ))}
        </svg>
      );
    case "text-highlights":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={4 + i * 19}
              y="8"
              width="14"
              height="24"
              rx="3"
              fill="currentColor"
              opacity="0.15"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={8 + i * 19}
              y="12"
              width="6"
              height="3"
              rx="1"
              fill="currentColor"
              opacity="0.4"
            />
          ))}
        </svg>
      );
    case "text-accordion":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x="4"
              y={6 + i * 9}
              width="52"
              height="6"
              rx="2"
              fill="currentColor"
              opacity={i === 0 ? 0.2 : 0.1}
            />
          ))}
        </svg>
      );
    case "image-grid":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="4" y="4" width="24" height="32" rx="3" fill="currentColor" opacity="0.15" />
          <rect x="32" y="4" width="24" height="32" rx="3" fill="currentColor" opacity="0.15" />
          <rect x="14" y="16" width="4" height="8" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="42" y="16" width="4" height="8" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "image-text":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="4" y="4" width="22" height="32" rx="3" fill="currentColor" opacity="0.15" />
          <rect x="30" y="8" width="26" height="4" rx="1.5" fill="currentColor" opacity="0.4" />
          <rect x="30" y="16" width="26" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="30" y="22" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
          <rect x="30" y="28" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case "gallery-carousel":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="10" y="4" width="40" height="28" rx="3" fill="currentColor" opacity="0.15" />
          <polygon points="15,18 20,13 20,23" fill="currentColor" opacity="0.35" />
          <polygon points="45,18 40,13 40,23" fill="currentColor" opacity="0.35" />
          <circle cx="26" cy="36" r="2" fill="currentColor" opacity="0.5" />
          <circle cx="30" cy="36" r="2" fill="currentColor" opacity="0.2" />
          <circle cx="34" cy="36" r="2" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case "gallery-scroll":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={4 + i * 20}
              y="6"
              width="16"
              height="28"
              rx="3"
              fill="currentColor"
              opacity="0.15"
            />
          ))}
        </svg>
      );
    case "embed-figma":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="8" y="4" width="44" height="32" rx="4" fill="currentColor" opacity="0.1" />
          <rect x="14" y="10" width="8" height="8" rx="4" fill="currentColor" opacity="0.4" />
          <rect x="24" y="10" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
          <rect x="14" y="20" width="8" height="8" rx="4" fill="currentColor" opacity="0.2" />
          <rect x="24" y="20" width="8" height="8" rx="2" fill="currentColor" opacity="0.15" />
        </svg>
      );
    case "embed-youtube":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="4" y="4" width="52" height="32" rx="4" fill="currentColor" opacity="0.12" />
          <circle cx="30" cy="20" r="8" fill="currentColor" opacity="0.2" />
          <polygon points="27,15.5 27,24.5 36,20" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case "embed-code":
      return (
        <svg viewBox="0 0 60 40" fill="none" className="h-full w-full text-current">
          <rect x="4" y="4" width="52" height="32" rx="4" fill="currentColor" opacity="0.1" />
          <rect x="8" y="8" width="44" height="4" rx="1" fill="currentColor" opacity="0.2" />
          <rect x="12" y="16" width="20" height="3" rx="1" fill="currentColor" opacity="0.35" />
          <rect x="12" y="22" width="32" height="3" rx="1" fill="currentColor" opacity="0.2" />
          <rect x="12" y="28" width="16" height="3" rx="1" fill="currentColor" opacity="0.35" />
        </svg>
      );
    default:
      return <div className="h-full w-full rounded bg-black/10" />;
  }
}

export default function SectionAddMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (type) => {
    onAdd(type);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-4 text-sm font-medium text-[#7A736C] transition-colors hover:border-black/30 dark:border-white/15 dark:text-[#9E9893] dark:hover:border-white/30"
      >
        <Plus size={16} />
        Add section
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-2xl border border-black/10 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#1A1A1A]">
          <div className="space-y-4">
            {SECTION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[11px] font-semibold tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]">
                  {group.label}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {group.types.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-black/[0.08] p-3 transition-colors hover:bg-black/[0.03] dark:border-white/[0.08] dark:hover:bg-white/[0.03]"
                    >
                      <div className="h-7 w-10 text-[#7A736C] dark:text-[#9E9893]">
                        <SectionPreview type={key} />
                      </div>
                      <span className="text-center text-[11px] leading-tight font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

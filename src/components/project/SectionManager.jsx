import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  AlignLeft,
  LayoutGrid,
  Columns3,
  Code2,
  X,
} from "lucide-react";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

import FreeformSection from "./sections/FreeformSection";
import ImageGridSection from "./sections/ImageGridSection";
import ImageTextSection from "./sections/ImageTextSection";
import TextSplitSection from "./sections/TextSplitSection";
import Text3ColSection from "./sections/Text3ColSection";
import TextHighlightsSection from "./sections/TextHighlightsSection";
import TextAccordionSection from "./sections/TextAccordionSection";
import CarouselSection from "./sections/CarouselSection";
import ScrollGallerySection from "./sections/ScrollGallerySection";
import EmbedSection from "./sections/EmbedSection";

// ─── Utils ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Wireframe SVG previews ───────────────────────────────────────────────────

function FreeformPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="12" y="10" width="72" height="7" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="12" y="24" width="156" height="4.5" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="12" y="33" width="136" height="4.5" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="12" y="46" width="156" height="38" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="74" y="58" width="24" height="16" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="12" y="92" width="156" height="4.5" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="12" y="101" width="110" height="4.5" rx="2" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

function TwoColPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      {[0, 1].map((i) => {
        const x = 10 + i * 90;
        return (
          <g key={i}>
            <rect x={x} y="10" width="76" height="48" rx="4" fill="currentColor" opacity="0.12" />
            <rect
              x={x + 26}
              y="24"
              width="24"
              height="18"
              rx="2"
              fill="currentColor"
              opacity="0.22"
            />
            <rect x={x} y="64" width="55" height="5" rx="2.5" fill="currentColor" opacity="0.35" />
            <rect
              x={x}
              y="74"
              width="76"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.15"
            />
            <rect
              x={x}
              y="82"
              width="64"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.15"
            />
            <rect
              x={x}
              y="90"
              width="52"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.15"
            />
          </g>
        );
      })}
    </svg>
  );
}

function ThreeColPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      {[0, 1, 2].map((i) => {
        const x = 8 + i * 58;
        return (
          <g key={i}>
            <rect x={x} y="10" width="50" height="38" rx="3" fill="currentColor" opacity="0.12" />
            <rect
              x={x + 13}
              y="20"
              width="14"
              height="14"
              rx="2"
              fill="currentColor"
              opacity="0.22"
            />
            <rect x={x} y="54" width="36" height="5" rx="2.5" fill="currentColor" opacity="0.35" />
            <rect
              x={x}
              y="64"
              width="50"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.15"
            />
            <rect
              x={x}
              y="72"
              width="42"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.15"
            />
          </g>
        );
      })}
    </svg>
  );
}

function MoreLayoutsPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="8" width="50" height="38" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="18" y="18" width="14" height="11" rx="2" fill="currentColor" opacity="0.20" />
      <rect x="65" y="8" width="50" height="38" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="75" y="18" width="14" height="11" rx="2" fill="currentColor" opacity="0.20" />
      <rect x="122" y="8" width="50" height="38" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="132" y="18" width="14" height="11" rx="2" fill="currentColor" opacity="0.20" />
      <rect x="8" y="54" width="76" height="58" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="28" y="70" width="24" height="18" rx="2" fill="currentColor" opacity="0.20" />
      <rect x="8" y="98" width="50" height="4" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="96" y="54" width="76" height="58" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="106" y="62" width="56" height="20" rx="3" fill="currentColor" opacity="0.13" />
      <rect x="126" y="70" width="16" height="12" rx="2" fill="currentColor" opacity="0.20" />
      <rect x="96" y="98" width="50" height="4" rx="2" fill="currentColor" opacity="0.22" />
      <circle cx="90" cy="83" r="10" fill="currentColor" opacity="0.12" />
      <rect x="87" y="82" width="6" height="2" rx="1" fill="currentColor" opacity="0.50" />
      <rect x="89" y="80" width="2" height="6" rx="1" fill="currentColor" opacity="0.50" />
    </svg>
  );
}

function ImageTextLeftPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="10" y="12" width="80" height="96" rx="5" fill="currentColor" opacity="0.13" />
      <rect x="30" y="40" width="40" height="32" rx="3" fill="currentColor" opacity="0.22" />
      <rect x="100" y="28" width="70" height="8" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="100" y="44" width="70" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="100" y="53" width="60" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="100" y="62" width="68" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="100" y="71" width="50" height="4" rx="2" fill="currentColor" opacity="0.16" />
    </svg>
  );
}

function ImageTextRightPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="10" y="28" width="70" height="8" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="10" y="44" width="70" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="10" y="53" width="60" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="10" y="62" width="68" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="10" y="71" width="50" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="90" y="12" width="80" height="96" rx="5" fill="currentColor" opacity="0.13" />
      <rect x="110" y="40" width="40" height="32" rx="3" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

function ImageTextTopPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="10" y="8" width="160" height="60" rx="5" fill="currentColor" opacity="0.13" />
      <rect x="70" y="26" width="40" height="28" rx="3" fill="currentColor" opacity="0.22" />
      <rect x="10" y="78" width="90" height="7" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="10" y="91" width="160" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="10" y="100" width="130" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="10" y="109" width="100" height="4" rx="2" fill="currentColor" opacity="0.16" />
    </svg>
  );
}

function TextSplitPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="30" width="68" height="9" rx="3" fill="currentColor" opacity="0.40" />
      <rect x="8" y="46" width="50" height="6" rx="2.5" fill="currentColor" opacity="0.22" />
      <rect x="96" y="20" width="76" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="30" width="76" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="40" width="60" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="50" width="72" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="60" width="52" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="70" width="68" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="96" y="80" width="44" height="4" rx="2" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

function TextThreeColPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      {[0, 1, 2].map((i) => {
        const x = 8 + i * 58;
        return (
          <g key={i}>
            <rect x={x} y="14" width="44" height="7" rx="3" fill="currentColor" opacity="0.38" />
            <rect
              x={x}
              y="28"
              width="50"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.16"
            />
            <rect
              x={x}
              y="36"
              width="42"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.16"
            />
            <rect
              x={x}
              y="44"
              width="48"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.16"
            />
            <rect
              x={x}
              y="52"
              width="36"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.16"
            />
          </g>
        );
      })}
    </svg>
  );
}

function TextHighlightsPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      {[0, 1, 2].map((i) => {
        const x = 6 + i * 57;
        return (
          <g key={i}>
            <rect x={x} y="20" width="51" height="60" rx="6" fill="currentColor" opacity="0.09" />
            <rect
              x={x + 6}
              y="33"
              width="32"
              height="6"
              rx="2.5"
              fill="currentColor"
              opacity="0.38"
            />
            <rect
              x={x + 6}
              y="46"
              width="38"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.18"
            />
            <rect
              x={x + 6}
              y="54"
              width="28"
              height="3.5"
              rx="1.75"
              fill="currentColor"
              opacity="0.18"
            />
          </g>
        );
      })}
    </svg>
  );
}

function TextAccordionPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="38" width="60" height="9" rx="3" fill="currentColor" opacity="0.38" />
      <rect x="8" y="54" width="44" height="5" rx="2" fill="currentColor" opacity="0.18" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="88"
            y={16 + i * 24}
            width="84"
            height="0.75"
            rx="0.375"
            fill="currentColor"
            opacity="0.14"
          />
          <rect
            x="88"
            y={22 + i * 24}
            width="52"
            height="5"
            rx="2"
            fill="currentColor"
            opacity={i === 0 ? 0.38 : 0.22}
          />
          <rect
            x="164"
            y={23 + i * 24}
            width="8"
            height="3"
            rx="1.5"
            fill="currentColor"
            opacity="0.30"
          />
          {i === 0 && (
            <>
              <rect
                x="88"
                y="34"
                width="84"
                height="3"
                rx="1.5"
                fill="currentColor"
                opacity="0.13"
              />
              <rect
                x="88"
                y="41"
                width="66"
                height="3"
                rx="1.5"
                fill="currentColor"
                opacity="0.13"
              />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function GalleryCarouselPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="24" y="8" width="132" height="88" rx="6" fill="currentColor" opacity="0.11" />
      <circle cx="14" cy="52" r="8" fill="currentColor" opacity="0.10" />
      <polyline
        points="16,48 12,52 16,56"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.40"
      />
      <circle cx="166" cy="52" r="8" fill="currentColor" opacity="0.10" />
      <polyline
        points="164,48 168,52 164,56"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.40"
      />
      <circle cx="84" cy="108" r="3.5" fill="currentColor" opacity="0.50" />
      <circle cx="96" cy="108" r="3.5" fill="currentColor" opacity="0.18" />
      <circle cx="108" cy="108" r="3.5" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

function GalleryScrollPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="2" y="18" width="44" height="84" rx="5" fill="currentColor" opacity="0.08" />
      <rect x="52" y="8" width="76" height="104" rx="6" fill="currentColor" opacity="0.14" />
      <rect x="134" y="18" width="44" height="84" rx="5" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

function FigmaEmbedPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="8" width="164" height="104" rx="6" fill="currentColor" opacity="0.09" />
      <rect x="8" y="8" width="164" height="18" rx="6" fill="currentColor" opacity="0.10" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="24" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="34" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="26" y="36" width="128" height="62" rx="4" fill="currentColor" opacity="0.10" />
      <rect x="40" y="52" width="36" height="28" rx="3" fill="currentColor" opacity="0.18" />
      <rect x="84" y="52" width="56" height="7" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="84" y="64" width="44" height="5" rx="2" fill="currentColor" opacity="0.14" />
      <rect x="84" y="73" width="50" height="5" rx="2" fill="currentColor" opacity="0.14" />
    </svg>
  );
}

function YoutubeEmbedPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="8" width="164" height="104" rx="6" fill="currentColor" opacity="0.10" />
      <circle cx="90" cy="56" r="18" fill="currentColor" opacity="0.16" />
      <polygon points="84,48 84,64 102,56" fill="currentColor" opacity="0.45" />
      <rect x="8" y="90" width="164" height="22" rx="0" fill="currentColor" opacity="0.07" />
      <rect x="14" y="96" width="60" height="5" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="14" y="104" width="40" height="4" rx="2" fill="currentColor" opacity="0.14" />
    </svg>
  );
}

function CodeEmbedPreview() {
  return (
    <svg viewBox="0 0 180 120" fill="none" className="h-full w-full">
      <rect x="8" y="8" width="164" height="104" rx="6" fill="currentColor" opacity="0.08" />
      <rect x="8" y="8" width="164" height="16" rx="6" fill="currentColor" opacity="0.12" />
      <circle cx="18" cy="16" r="3.5" fill="currentColor" opacity="0.30" />
      <circle cx="28" cy="16" r="3.5" fill="currentColor" opacity="0.30" />
      <circle cx="38" cy="16" r="3.5" fill="currentColor" opacity="0.30" />
      <rect x="16" y="34" width="28" height="4" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="48" y="34" width="44" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="24" y="44" width="36" height="4" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="64" y="44" width="56" height="4" rx="2" fill="currentColor" opacity="0.14" />
      <rect x="24" y="54" width="20" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="48" y="54" width="68" height="4" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="16" y="64" width="48" height="4" rx="2" fill="currentColor" opacity="0.30" />
      <rect x="68" y="64" width="32" height="4" rx="2" fill="currentColor" opacity="0.16" />
      <rect x="24" y="74" width="60" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="16" y="84" width="28" height="4" rx="2" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

// ─── Modal categories ─────────────────────────────────────────────────────────

const MODAL_CATEGORIES = [
  {
    key: "text",
    label: "Text",
    icon: AlignLeft,
    layouts: [
      {
        key: "freeform",
        label: "Freeform",
        sub: "Rich text, headings, images",
        Preview: FreeformPreview,
      },
      {
        key: "text-split",
        label: "Split",
        sub: "Heading left, body right",
        Preview: TextSplitPreview,
      },
      {
        key: "text-3col",
        label: "3-Column",
        sub: "Three columns of heading + text",
        Preview: TextThreeColPreview,
      },
      {
        key: "text-highlights",
        label: "Highlights",
        sub: "Three stat or highlight cards",
        Preview: TextHighlightsPreview,
      },
      {
        key: "text-accordion",
        label: "Accordion",
        sub: "Heading with collapsible FAQ rows",
        Preview: TextAccordionPreview,
      },
    ],
  },
  {
    key: "image-text",
    label: "Image & text",
    icon: LayoutGrid,
    layouts: [
      {
        key: "image-text-left",
        label: "Image left",
        sub: "Image on the left, text on the right",
        Preview: ImageTextLeftPreview,
      },
      {
        key: "image-text-right",
        label: "Image right",
        sub: "Text on the left, image on the right",
        Preview: ImageTextRightPreview,
      },
      {
        key: "image-text-top",
        label: "Image top",
        sub: "Full-width image above the text",
        Preview: ImageTextTopPreview,
      },
      {
        key: "image-grid-2",
        label: "2-Column",
        sub: "Two image + caption cards",
        Preview: TwoColPreview,
      },
      {
        key: "image-grid-3",
        label: "3-Column",
        sub: "Three image + caption cards",
        Preview: ThreeColPreview,
      },
    ],
  },
  {
    key: "gallery",
    label: "Gallery & media",
    icon: Columns3,
    layouts: [
      {
        key: "gallery-carousel",
        label: "Carousel",
        sub: "One image at a time with arrows",
        Preview: GalleryCarouselPreview,
      },
      {
        key: "gallery-scroll",
        label: "Scroll gallery",
        sub: "Horizontal scroll, center image large",
        Preview: GalleryScrollPreview,
      },
    ],
  },
  {
    key: "embeds",
    label: "Embeds",
    icon: Code2,
    layouts: [
      {
        key: "embed-figma",
        label: "Figma",
        sub: "Embed a Figma file or prototype",
        Preview: FigmaEmbedPreview,
      },
      {
        key: "embed-youtube",
        label: "YouTube",
        sub: "Embed a YouTube video",
        Preview: YoutubeEmbedPreview,
      },
      {
        key: "embed-code",
        label: "Code",
        sub: "Display a code snippet inline",
        Preview: CodeEmbedPreview,
      },
    ],
  },
];

// ─── Add section modal (portal) ───────────────────────────────────────────────

function AddSectionModal({ onAdd, onClose }) {
  const [activeCategory, setActiveCategory] = useState("text");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Client-only mount guard for SSR hydration safety
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const currentLayouts = MODAL_CATEGORIES.find((c) => c.key === activeCategory)?.layouts ?? [];

  const layoutCards = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="grid grid-cols-2 gap-3"
      >
        {currentLayouts.map(({ key, label, sub, Preview }) => (
          <motion.button
            key={key}
            onClick={() => {
              onAdd(key);
              onClose();
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-black/[0.07] bg-[#F7F5F0] text-left transition-colors hover:border-black/20 hover:shadow-md dark:border-white/[0.07] dark:bg-[#221F18] dark:hover:border-white/15"
          >
            <div className="flex aspect-[16/9] w-full items-center justify-center p-5 text-[#1A1A1A] dark:text-[#F0EDE7]">
              <Preview />
            </div>
            <div className="border-t border-black/[0.05] bg-white px-4 py-3 dark:border-white/[0.05] dark:bg-[#1C1A13]">
              <p className="text-[13px] leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                {label}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-[#9E9893] dark:text-[#6A6460]">
                {sub}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );

  if (!mounted) return null;

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-[520px] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#18160F]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Left sidebar */}
        <div className="flex w-52 shrink-0 flex-col gap-1 border-r border-black/[0.08] bg-[#EDE9E0] px-3 py-5 dark:border-white/[0.08] dark:bg-[#1C1A13]">
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.15em] text-[#B5AFA5] uppercase dark:text-[#5A5450]">
            Add section
          </p>
          <button
            onClick={() => {
              onAdd("freeform");
              onClose();
            }}
            className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-xl border border-black/[0.14] bg-white/60 px-3 py-2 text-[13px] font-medium text-[#1A1A1A] transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-black/25 hover:bg-white active:scale-[0.98] dark:border-white/[0.14] dark:bg-white/[0.04] dark:text-[#F0EDE7] dark:hover:border-white/25 dark:hover:bg-white/[0.09]"
          >
            <AlignLeft size={14} strokeWidth={2} />
            Freeform
          </button>
          <div className="my-2 flex items-center gap-2.5 px-1">
            <div className="h-px flex-1 bg-black/[0.09] dark:bg-white/[0.08]" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-[#B5AFA5] uppercase dark:text-[#5A5450]">
              or
            </span>
            <div className="h-px flex-1 bg-black/[0.09] dark:bg-white/[0.08]" />
          </div>
          {MODAL_CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                activeCategory === key
                  ? "bg-white text-[#1A1A1A] dark:bg-[#2A2720] dark:text-[#F0EDE7]"
                  : "text-[#7A736C] hover:bg-white/60 hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:bg-white/5 dark:hover:text-[#F0EDE7]"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/[0.08] px-6 py-4 dark:border-white/[0.08]">
            <p className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              {MODAL_CATEGORIES.find((c) => c.key === activeCategory)?.label}
            </p>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9E9893] transition-colors hover:bg-black/5 hover:text-[#1A1A1A] dark:hover:bg-white/5 dark:hover:text-[#F0EDE7]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{layoutCards}</div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(content, document.body);
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  const [modalOpen, setModalOpen] = useState(false);

  const cards = [
    {
      label: "Freeform",
      sub: "Text, headings, images",
      Preview: FreeformPreview,
      action: () => onAdd("freeform"),
    },
    {
      label: "2-Column",
      sub: "Image + caption, side by side",
      Preview: TwoColPreview,
      action: () => onAdd("image-grid-2"),
    },
    {
      label: "More layouts",
      sub: "Image grid, image + text & more",
      Preview: MoreLayoutsPreview,
      action: () => setModalOpen(true),
    },
  ];

  const rotations = [-2, 1.5, -1];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-20 select-none"
      >
        <p className="mb-8 text-[10px] font-semibold tracking-[0.2em] text-[#B5AFA5] uppercase dark:text-[#5A5450]">
          Choose a section type to begin
        </p>

        <div className="flex w-full max-w-[780px] flex-col items-stretch gap-3 px-6 sm:flex-row">
          {cards.map(({ label, sub, Preview, action }, i) => (
            <motion.button
              key={label}
              onClick={action}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              whileHover={{
                scale: 1.04,
                rotate: rotations[i],
                transition: { type: "spring", stiffness: 400, damping: 18 },
              }}
              whileTap={{
                scale: 0.97,
                rotate: 0,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
              className="group flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-[#F7F5F2] text-left hover:border-black/[0.18] hover:shadow-lg dark:border-white/[0.07] dark:bg-[#222222] dark:hover:border-white/[0.18]"
            >
              <div className="flex-1 p-5 pb-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <div className="aspect-[3/2] w-full">
                  <Preview />
                </div>
              </div>
              <div className="border-t border-black/[0.05] px-5 pt-2 pb-5 dark:border-white/[0.05]">
                <p className="mb-0.5 text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                  {label}
                </p>
                <p className="text-[11.5px] leading-snug text-[#9E9893] dark:text-[#6A6460]">
                  {sub}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && <AddSectionModal onAdd={onAdd} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Add section button (between sections) ────────────────────────────────────

function AddSectionButton({ onAdd }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group/addbtn relative flex w-full items-center justify-center py-4">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/[0.08] dark:bg-white/[0.08]" />
        <button
          onClick={() => setOpen(true)}
          className="relative z-10 flex cursor-pointer items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-[12.5px] font-medium text-white shadow-sm transition-all duration-150 hover:opacity-80 active:scale-95 dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
          aria-label="Add section"
        >
          <Plus size={13} />
          Add section
        </button>
      </div>

      <AnimatePresence>
        {open && <AddSectionModal onAdd={onAdd} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Section factory ──────────────────────────────────────────────────────────

function makeSection(typeKey) {
  const _id = uid();
  const bodyPlaceholder =
    "You can write here as much as you want, this text will always look nice, whether you write longer paragraphs or just a few words.";
  if (typeKey === "freeform") {
    return { _id, type: "freeform", content: { tiptapContent: null } };
  }
  if (typeKey === "image-grid-2") {
    return {
      _id,
      type: "image-grid",
      content: {
        columns: 2,
        images: [
          { url: null, caption: "", width: null, height: null },
          { url: null, caption: "", width: null, height: null },
        ],
      },
    };
  }
  if (typeKey === "image-grid-3") {
    return {
      _id,
      type: "image-grid",
      content: {
        columns: 3,
        images: [
          { url: null, caption: "", width: null, height: null },
          { url: null, caption: "", width: null, height: null },
          { url: null, caption: "", width: null, height: null },
        ],
      },
    };
  }
  if (typeKey === "image-text-left") {
    return {
      _id,
      type: "image-text",
      content: {
        layout: "image-left",
        image: { url: null, width: null, height: null },
        heading: "Write your important statement here",
        body: "You can write here as much as you want. This text will always look nice, whether you write longer paragraphs or just a few words.",
      },
    };
  }
  if (typeKey === "image-text-right") {
    return {
      _id,
      type: "image-text",
      content: {
        layout: "image-right",
        image: { url: null, width: null, height: null },
        heading: "Write your important statement here",
        body: "You can write here as much as you want. This text will always look nice, whether you write longer paragraphs or just a few words.",
      },
    };
  }
  if (typeKey === "image-text-top") {
    return {
      _id,
      type: "image-text",
      content: {
        layout: "image-top",
        image: { url: null, width: null, height: null },
        heading: "Write your important statement here",
        body: "You can write here as much as you want. This text will always look nice, whether you write longer paragraphs or just a few words.",
      },
    };
  }
  if (typeKey === "text-split") {
    return {
      _id,
      type: "text-split",
      content: { heading: "This is your heading", body: bodyPlaceholder },
    };
  }
  if (typeKey === "text-3col") {
    return {
      _id,
      type: "text-3col",
      content: {
        columns: [
          { heading: "This is your heading", body: bodyPlaceholder },
          { heading: "This is your heading", body: bodyPlaceholder },
          { heading: "This is your heading", body: bodyPlaceholder },
        ],
      },
    };
  }
  if (typeKey === "text-highlights") {
    return {
      _id,
      type: "text-highlights",
      content: {
        items: [
          { title: "Highlight 1", detail: "Add some details here" },
          { title: "Highlight 2", detail: "Add some details here" },
          { title: "Highlight 3", detail: "Add some details here" },
        ],
      },
    };
  }
  if (typeKey === "text-accordion") {
    return {
      _id,
      type: "text-accordion",
      content: {
        heading: "This is your heading",
        items: [
          { question: "Accordion 1", answer: bodyPlaceholder },
          { question: "Accordion 2", answer: "" },
          { question: "Accordion 3", answer: "" },
          { question: "Accordion 4", answer: "" },
        ],
      },
    };
  }
  if (typeKey === "gallery-carousel") {
    return {
      _id,
      type: "gallery-carousel",
      content: {
        items: [
          { url: null, caption: "" },
          { url: null, caption: "" },
          { url: null, caption: "" },
        ],
      },
    };
  }
  if (typeKey === "gallery-scroll") {
    return {
      _id,
      type: "gallery-scroll",
      content: { items: [{ url: null }, { url: null }, { url: null }, { url: null }] },
    };
  }
  if (typeKey === "embed-figma") {
    return {
      _id,
      type: "embed-figma",
      content: { embedType: "figma", url: "", code: "", language: "" },
    };
  }
  if (typeKey === "embed-youtube") {
    return {
      _id,
      type: "embed-youtube",
      content: { embedType: "youtube", url: "", code: "", language: "" },
    };
  }
  if (typeKey === "embed-code") {
    return {
      _id,
      type: "embed-code",
      content: { embedType: "code", url: "", code: "", language: "javascript" },
    };
  }
  return { _id, type: "freeform", content: { tiptapContent: null } };
}

// ─── Section component dispatch ───────────────────────────────────────────────

function renderSectionComponent(section, mode, onContentChange) {
  const props = {
    section,
    mode,
    onChange: (content) => onContentChange(section._id, content),
  };

  switch (section.type) {
    case "freeform":
      return <FreeformSection {...props} />;
    case "image-grid":
      return <ImageGridSection {...props} />;
    case "image-text":
      return <ImageTextSection {...props} />;
    case "text-split":
      return <TextSplitSection {...props} />;
    case "text-3col":
      return <Text3ColSection {...props} />;
    case "text-highlights":
      return <TextHighlightsSection {...props} />;
    case "text-accordion":
      return <TextAccordionSection {...props} />;
    case "gallery-carousel":
      return <CarouselSection {...props} />;
    case "gallery-scroll":
      return <ScrollGallerySection {...props} />;
    case "embed-figma":
    case "embed-youtube":
    case "embed-code":
    case "embed":
      return <EmbedSection {...props} />;
    default:
      return null;
  }
}

// ─── Section wrapper with reorder + delete controls ───────────────────────────

const CONTROL_BTN =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-black/[0.08] bg-white/80 text-[#9E9893] shadow-sm transition-colors hover:bg-black/[0.03] hover:text-[#1A1A1A] dark:border-white/[0.08] dark:bg-[#2A2520]/80 dark:hover:bg-white/5 dark:hover:text-[#F0EDE7]";

function SectionRow({
  section,
  mode,
  onContentChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group/section relative mx-auto max-w-[880px]"
    >
      {/* Left-side controls — visible on group-hover, positioned in left gutter */}
      {mode === "editor" && (
        <div className="absolute top-1/2 -left-10 z-10 flex -translate-y-1/2 flex-col items-center gap-1 opacity-0 transition-opacity group-hover/section:opacity-100">
          {canMoveUp && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onMoveUp} className={CONTROL_BTN} aria-label="Move section up">
                  <ChevronUp size={17} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="px-2 py-1 text-[11px]">
                Move up
              </TooltipContent>
            </Tooltip>
          )}

          {canMoveDown && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onMoveDown} className={CONTROL_BTN} aria-label="Move section down">
                  <ChevronDown size={17} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="px-2 py-1 text-[11px]">
                Move down
              </TooltipContent>
            </Tooltip>
          )}

          {(canMoveUp || canMoveDown) && (
            <div className="my-0.5 h-px w-4 bg-black/[0.08] dark:bg-white/[0.08]" />
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-black/[0.08] bg-white/80 text-[#9E9893] shadow-sm transition-colors hover:bg-red-50 hover:text-red-500 dark:border-white/[0.08] dark:bg-[#2A2520]/80 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label="Delete section"
              >
                <Trash2 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="px-2 py-1 text-[11px]">
              Delete
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {renderSectionComponent(section, mode, onContentChange)}
    </motion.div>
  );
}

// ─── Main SectionManager ──────────────────────────────────────────────────────

export default function SectionManager({ sections = [], onChange, mode }) {
  const handleContentChange = (id, newContent) => {
    onChange(sections.map((s) => (s._id === id ? { ...s, content: newContent } : s)));
  };

  const handleDelete = (id) => {
    onChange(sections.filter((s) => s._id !== id));
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addSection = (typeKey, afterIndex) => {
    const section = makeSection(typeKey);
    if (afterIndex === undefined || afterIndex >= sections.length - 1) {
      onChange([...sections, section]);
    } else {
      const next = [...sections];
      next.splice(afterIndex + 1, 0, section);
      onChange(next);
    }
  };

  // Read-only / public view — no controls, no add buttons
  if (mode !== "editor") {
    return (
      <div>
        {sections.map((section) => (
          <div key={section._id}>{renderSectionComponent(section, mode, () => {})}</div>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <AnimatePresence mode="wait">
        {sections.length === 0 ? (
          <EmptyState key="empty" onAdd={addSection} />
        ) : (
          <motion.div
            key="sections"
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <AnimatePresence>
              {sections.map((section, index) => (
                <div key={section._id}>
                  <SectionRow
                    section={section}
                    mode={mode}
                    onContentChange={handleContentChange}
                    onDelete={() => handleDelete(section._id)}
                    onMoveUp={() => handleMove(index, -1)}
                    onMoveDown={() => handleMove(index, 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sections.length - 1}
                  />
                  <AddSectionButton onAdd={(typeKey) => addSection(typeKey, index)} />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

import { cn } from "@/lib/utils";

// Editorial thumbnail width picker — slides in from the left on hover of the
// `group/widthpicker` ancestor. Editor-only.
export default function ThumbnailWidthToggle({ thumbnailWidth, setThumbnailWidth }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-3 z-30 -translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover/widthpicker:pointer-events-auto group-hover/widthpicker:translate-x-0 group-hover/widthpicker:opacity-100">
      <div className="flex flex-col gap-0.5 rounded-xl border border-black/[0.06] bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#2A2520]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setThumbnailWidth("full");
          }}
          title="Full width"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            thumbnailWidth === "full"
              ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
              : "text-[#7A736C] hover:bg-black/5 dark:text-[#9E9893] dark:hover:bg-white/5"
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="4" width="12" height="6" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setThumbnailWidth("contained");
          }}
          title="Contained width"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            thumbnailWidth === "contained"
              ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
              : "text-[#7A736C] hover:bg-black/5 dark:text-[#9E9893] dark:hover:bg-white/5"
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3.5" y="4" width="7" height="6" rx="1" fill="currentColor" />
            <rect x="1" y="5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.35" />
            <rect
              x="11.5"
              y="5"
              width="1.5"
              height="4"
              rx="0.5"
              fill="currentColor"
              opacity="0.35"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

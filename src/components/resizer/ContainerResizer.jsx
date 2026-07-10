import { useRef, useState } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { TEMPLATE_CONTAINER_WIDTHS, CONTAINER_WIDTH_PRESETS } from "@/lib/constant";
import { cn } from "@/lib/utils";
import ResizeGripHandle from "./ResizeGripHandle";
import ContainerWidthToolbar from "./ContainerWidthToolbar";

/**
 * Editor-only wrapper that lets the user resize the portfolio content width via on-canvas
 * left/right drag handles + a floating preset toolbar (mirrors the reference home.tsx).
 * Reads/writes the width through globalContext (changeContainerWidth), so templates — which
 * read containerMaxWidth — follow the drag live. Templates without a width config (RetroOS)
 * render untouched.
 *
 * Chrome (toolbar + handles) lives in a sticky, zero-height sentinel so it floats near the
 * top of the viewport and stays pinned as the page scrolls.
 */
export default function ContainerResizer({ children, className, contentClassName }) {
  const { template, containerMaxWidth, changeContainerWidth } = useGlobalContext();
  const cfg = TEMPLATE_CONTAINER_WIDTHS[template];

  const [isResizing, setIsResizing] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const lastWidthRef = useRef(null);

  // No width control for this template (e.g. RetroOS full-screen desktop).
  if (!cfg) {
    return <div className={cn("mx-auto w-full", className)}>{children}</div>;
  }

  const width = containerMaxWidth ?? cfg.default;
  const presets = CONTAINER_WIDTH_PRESETS.filter((w) => w <= cfg.max);
  const chromeVisible = showHandles || isResizing;

  const clamp = (w) => Math.min(cfg.max, Math.max(cfg.min, Math.round(w)));

  const handleMouseDown = (e, side) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startWidth: width, side };
    lastWidthRef.current = width;
    setIsResizing(true);

    // Lock the horizontal double-arrow cursor on <body> so fast drags that leave the
    // handle keep the correct cursor (restored on mouse up).
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const { startX, startWidth, side: s } = dragRef.current;
      const delta = ev.clientX - startX;
      // Container is centred, so both edges move — 2×delta keeps the handle under the cursor.
      const raw = s === "right" ? startWidth + delta * 2 : startWidth - delta * 2;
      const next = clamp(raw);
      lastWidthRef.current = next;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => changeContainerWidth(next, false));
    };

    const onUp = () => {
      dragRef.current = null;
      setIsResizing(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
      changeContainerWidth(lastWidthRef.current, true); // commit + persist
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // Indigo focus glow around the content while hovering a handle / dragging (reference card).
  const glowShadow =
    handleHovered || isResizing
      ? isResizing
        ? "0 0 0 2px rgba(99,102,241,0.45), 0 0 40px rgba(99,102,241,0.1)"
        : "0 0 0 1.5px rgba(99,102,241,0.28), 0 0 24px rgba(99,102,241,0.08)"
      : undefined;

  return (
    <div
      className={cn("relative mx-auto w-full", className)}
      style={{
        maxWidth: width,
        transition: isResizing ? "none" : "max-width 0.2s cubic-bezier(0.23,1,0.32,1)",
      }}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => {
        if (!isResizing) {
          setShowHandles(false);
          setHandleHovered(false);
        }
      }}
    >
      {/* Sticky sentinel — holds the floating toolbar + edge handles, pinned near the top */}
      <div className="pointer-events-none sticky top-[100px] z-[60] h-0 overflow-visible">
        <ContainerWidthToolbar
          width={width}
          presets={presets}
          maxWidth={cfg.max}
          isResizing={isResizing}
          visible={chromeVisible}
          onSelect={(w) => changeContainerWidth(w, true)}
        />
      </div>
      <div className="pointer-events-none sticky top-[300px] z-[60] h-0 overflow-visible">
        <ResizeGripHandle
          side="left"
          active={isResizing}
          visible={chromeVisible}
          onMouseDown={handleMouseDown}
          onHoverChange={setHandleHovered}
        />
        <ResizeGripHandle
          side="right"
          active={isResizing}
          visible={chromeVisible}
          onMouseDown={handleMouseDown}
          onHoverChange={setHandleHovered}
        />
      </div>
      {/* Glow hugs the actual content container tightly (no extra padding inside the outline).
          contentClassName is for margin-based offsets only (e.g. Mono's wallpaper reveal
          space) — margin sits outside this div's own border-box, so it shifts the content
          down without the box-shadow outline growing to include it, and without moving the
          toolbar/handle sentinels above (which are earlier siblings, unaffected either way). */}
      <div
        className={cn("relative", contentClassName)}
        style={{ boxShadow: glowShadow, transition: "box-shadow 0.2s ease" }}
      >
        {children}
      </div>
    </div>
  );
}

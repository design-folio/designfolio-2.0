"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { cn } from "@/lib/utils";

/** Approximate chars per line for typical prose (16px, ~60ch). ~3 lines ≈ 150-180 chars */
const CHARS_PER_LINE = 55;
const DEFAULT_MAX_LINES = 3;

/**
 * Renders TipTap content with line-based truncation (not height-based).
 * Shows "View more" after maxLines (default 3). Uses line-clamp for consistent layout.
 */
export default function ClampableTiptapContent({
  content = "",
  mode = "review",
  enableBulletList = false,
  maxLines = DEFAULT_MAX_LINES,
  className = "",
  buttonClassName = "mt-2 text-df-description-color hover:text-df-heading-color inline-flex items-center gap-1 underline underline-offset-4",
  expandedIds = [],
  onToggleExpand,
  itemId,
}) {
  const containerRef = useRef(null);
  const [exceedsLines, setExceedsLines] = useState(false);
  const [measured, setMeasured] = useState(false);

  const plainLength = getPlainTextLength(content);
  const charThreshold = CHARS_PER_LINE * maxLines;
  const likelyExceeds = plainLength > charThreshold;

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = itemId && expandedIds
    ? expandedIds.includes(itemId)
    : internalExpanded;
  const shouldShowToggle = likelyExceeds;
  const isCollapsed = shouldShowToggle && !isExpanded;

  const handleToggle = (e) => {
    e?.stopPropagation?.();
    if (itemId && onToggleExpand) {
      onToggleExpand(itemId);
    } else {
      setInternalExpanded((p) => !p);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !isCollapsed || !likelyExceeds) return;
    const el = containerRef.current;
    const check = () => {
      if (el.scrollHeight > el.clientHeight + 2) {
        setExceedsLines(true);
      } else {
        setExceedsLines(false);
      }
      setMeasured(true);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [content, isCollapsed, likelyExceeds]);

  const showButton = shouldShowToggle && (measured ? exceedsLines : likelyExceeds);

  if (!content) return null;

  return (
    <div className={cn("text-base leading-relaxed text-df-description-color", className)}>
      <div
        ref={containerRef}
        className={cn(
          "relative",
          isCollapsed && "line-clamp-3"
        )}
      >
        <SimpleTiptapRenderer
          content={content}
          mode={mode}
          enableBulletList={enableBulletList}
          className="rounded-none shadow-none"
        />
      </div>
      {showButton && (
        <button
          type="button"
          onClick={(e) => handleToggle(e)}
          className={cn("shrink-0", buttonClassName)}
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View More
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

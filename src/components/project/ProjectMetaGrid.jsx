import { useRef, useEffect } from "react";
import { normalizeEditableEmpty, handlePlainTextPaste } from "./editableUtils";
import { DEFAULT_META_FIELDS, getMetaLabel, getMetaValue } from "@/lib/constant";

// Whether any meta field has a value — used by callers to conditionally render
// a divider/wrapper around the grid in published / preview mode.
export function hasProjectMeta(project) {
  return DEFAULT_META_FIELDS.some(({ index }) => getMetaValue(project, index).trim() !== "");
}

// Spread visible fields across the width by matching column count to field count.
const COLS_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export function metaColsClass(count) {
  return COLS_CLASS[count] ?? "grid-cols-2 md:grid-cols-4";
}

// ─── Editable value cell ──────────────────────────────────────────────────────
function EditableCell({ value, onCommit, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => normalizeEditableEmpty(e.currentTarget)}
      onPaste={handlePlainTextPaste}
      onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="block cursor-text rounded-sm text-[15px] font-medium [overflow-wrap:anywhere] text-[#1A1A1A] transition-colors outline-none focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#F0EDE7] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
    />
  );
}

// ─── Editable label cell ──────────────────────────────────────────────────────
function EditableLabel({ label, onCommit }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = label || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onPaste={handlePlainTextPaste}
      onBlur={(e) => {
        const text = e.currentTarget.textContent?.trim() ?? "";
        onCommit(text || null); // null → backend stores null → frontend falls back to default
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        // Hard-cap at 30 chars
        if (
          e.currentTarget.textContent.length >= 30 &&
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey
        ) {
          e.preventDefault();
        }
      }}
      className="block cursor-text rounded-sm text-[11px] font-medium tracking-widest text-[#7A736C] uppercase transition-colors outline-none focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#9E9893] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
    />
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
// onMetaChange(index, patch) — patch is { label } or { value }
export default function ProjectMetaGrid({ project, onMetaChange, mode }) {
  const isEditable = mode === "editor";

  // Editor shows all fields so they can be filled in. Published / preview only
  // show filled fields and spread them across the available width.
  const visibleFields = isEditable
    ? DEFAULT_META_FIELDS
    : DEFAULT_META_FIELDS.filter(({ index }) => getMetaValue(project, index).trim() !== "");

  if (visibleFields.length === 0) return null;

  const colsClass = isEditable ? "grid-cols-2 md:grid-cols-4" : metaColsClass(visibleFields.length);

  return (
    <div className={`grid ${colsClass} gap-6 py-6`}>
      {visibleFields.map(({ index, defaultLabel }) => {
        const label = getMetaLabel(project, index);
        const value = getMetaValue(project, index);

        return (
          <div key={index} className="flex min-w-0 flex-col gap-1.5">
            {isEditable ? (
              <EditableLabel
                label={label}
                onCommit={(newLabel) => {
                  onMetaChange?.(index, { label: newLabel });
                }}
              />
            ) : (
              <span className="text-[11px] font-medium tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]">
                {label}
              </span>
            )}

            {isEditable ? (
              <EditableCell
                value={value}
                onCommit={(val) => onMetaChange?.(index, { value: val })}
                placeholder="Write here…"
              />
            ) : (
              <span className="text-[15px] font-semibold [overflow-wrap:anywhere] text-[#1A1A1A] dark:text-[#F0EDE7]">
                {value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

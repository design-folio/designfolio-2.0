import { useRef, useEffect } from "react";
import { normalizeEditableEmpty, handlePlainTextPaste } from "./editableUtils";

const FIELDS = [
  { key: "client", label: "Client" },
  { key: "industry", label: "Industry" },
  { key: "role", label: "Role" },
  { key: "platform", label: "Platform" },
];

const hasValue = (project, key) => String(project?.[key] ?? "").trim() !== "";

// Whether any meta field is filled — used by callers to avoid rendering an
// empty divider/wrapper around the grid in published / preview.
export function hasProjectMeta(project) {
  return FIELDS.some(({ key }) => hasValue(project, key));
}

// Spread the visible fields across the width by matching the column count to
// the number of filled fields. Mobile stays at two-per-row to match the hero.
const COLS_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

// Column class for a given number of visible meta fields. Shared with the
// immersive hero grid so both views spread filled fields the same way.
export function metaColsClass(count) {
  return COLS_CLASS[count] ?? "grid-cols-2 md:grid-cols-4";
}

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
      className="block cursor-text rounded-sm text-[15px] font-medium text-[#1A1A1A] transition-colors outline-none focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#F0EDE7] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
    />
  );
}

export default function ProjectMetaGrid({ project, onChange, mode }) {
  const isEditable = mode === "editor";

  // Editor shows all fields so they can be filled in. Published / preview only
  // show filled fields and spread them across the available width.
  const visibleFields = isEditable ? FIELDS : FIELDS.filter(({ key }) => hasValue(project, key));

  if (visibleFields.length === 0) return null;

  const colsClass = isEditable ? "grid-cols-2 md:grid-cols-4" : metaColsClass(visibleFields.length);

  return (
    <div className={`grid ${colsClass} gap-6 py-6`}>
      {visibleFields.map(({ key, label }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-widest text-[#7A736C] uppercase dark:text-[#9E9893]">
            {label}
          </span>
          {isEditable ? (
            <EditableCell
              value={project?.[key] ?? ""}
              onCommit={(val) => onChange({ [key]: val })}
              placeholder={`Add ${label.toLowerCase()}…`}
            />
          ) : (
            <span className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              {project?.[key]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

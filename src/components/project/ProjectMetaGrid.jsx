import { useRef, useEffect } from "react";

const FIELDS = [
  { key: "client", label: "Client" },
  { key: "industry", label: "Industry" },
  { key: "role", label: "Role" },
  { key: "platform", label: "Platform" },
];

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
      onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="block cursor-text rounded-sm text-[15px] font-semibold text-[#1A1A1A] transition-colors outline-none focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#F0EDE7] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
    />
  );
}

export default function ProjectMetaGrid({ project, onChange, mode }) {
  const isEditable = mode === "editor";

  return (
    <div className="grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
      {FIELDS.map(({ key, label }) => (
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
              {project?.[key] || "—"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

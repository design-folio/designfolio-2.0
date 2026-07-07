import { useRef, useEffect } from "react";
import { normalizeEditableEmpty, handlePlainTextPaste } from "./editableUtils";

export default function EditableField({
  value,
  onChange,
  tag: Tag = "span",
  placeholder,
  className,
  readOnly,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  if (readOnly) {
    return <Tag className={className}>{value || ""}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => normalizeEditableEmpty(e.currentTarget)}
      onPaste={handlePlainTextPaste}
      onBlur={(e) => onChange?.(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter" && Tag !== "div" && Tag !== "p") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={[
        "block w-full cursor-text rounded-sm [overflow-wrap:anywhere] transition-colors outline-none",
        className ?? "",
      ].join(" ")}
    />
  );
}

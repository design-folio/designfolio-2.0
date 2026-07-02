import { useRef, useEffect } from "react";
import { normalizeEditableEmpty, handlePlainTextPaste } from "./editableUtils";

export default function EditableText({
  value,
  onChange,
  placeholder,
  className,
  tag: Tag = "div",
  onKeyDown,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Insert a consistent <br> line break across browsers (native Enter
      // inserts <div> in Chrome, <br> in Firefox) and keep the caret on the
      // new line. Applies to every field, headings included.
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
    onKeyDown?.(e);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => normalizeEditableEmpty(e.currentTarget)}
      onPaste={handlePlainTextPaste}
      onBlur={(e) => {
        // innerText preserves \n from <br> elements; trim trailing newlines
        // that browsers append when the last action is a line break
        const text = (e.currentTarget.innerText ?? "").replace(/\n+$/, "");
        onChange(text);
      }}
      onKeyDown={handleKeyDown}
      className={`cursor-text outline-none [overflow-wrap:anywhere]${className ? ` ${className}` : ""}`}
    />
  );
}

import { useRef, useEffect } from "react";

export default function EditableText({
  value,
  onChange,
  placeholder,
  className,
  tag: Tag = "span",
  onKeyDown,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={onKeyDown}
      className={`outline-none cursor-text${className ? ` ${className}` : ""}`}
    />
  );
}

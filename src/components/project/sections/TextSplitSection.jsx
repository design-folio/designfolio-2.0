import EditableText from "@/components/project/EditableText";

export default function TextSplitSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || { heading: "", body: "" };
  const { heading, body } = content;

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          {editable ? (
            <EditableText
              value={heading}
              onChange={(v) => onChange({ ...content, heading: v })}
              placeholder="Heading…"
              tag="span"
              className="block text-2xl font-bold text-[#1A1A1A] md:text-3xl dark:text-[#F0EDE7]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            />
          ) : (
            <h3 className="text-2xl font-bold text-[#1A1A1A] md:text-3xl dark:text-[#F0EDE7]">
              {heading}
            </h3>
          )}
        </div>
        <div>
          {editable ? (
            <EditableText
              value={body}
              onChange={(v) => onChange({ ...content, body: v })}
              placeholder="Body text…"
              tag="div"
              className="text-base leading-relaxed text-[#7A736C] dark:text-[#9E9893]"
            />
          ) : (
            <p className="text-base leading-relaxed text-[#7A736C] dark:text-[#9E9893]">{body}</p>
          )}
        </div>
      </div>
    </div>
  );
}

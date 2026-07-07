import EditableText from "@/components/project/EditableText";

const DEFAULT_COLS = [
  { heading: "", body: "" },
  { heading: "", body: "" },
  { heading: "", body: "" },
];

export default function Text3ColSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || { columns: DEFAULT_COLS };
  const columns = content.columns?.length === 3 ? content.columns : DEFAULT_COLS;

  const updateCol = (index, patch) => {
    const next = columns.map((col, i) => (i === index ? { ...col, ...patch } : col));
    onChange({ ...content, columns: next });
  };

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {columns.map((col, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-2">
            {editable ? (
              <>
                <EditableText
                  value={col.heading}
                  onChange={(v) => updateCol(i, { heading: v })}
                  placeholder="Heading…"
                  tag="div"
                  className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]"
                />
                <EditableText
                  value={col.body}
                  onChange={(v) => updateCol(i, { body: v })}
                  placeholder="Body…"
                  tag="div"
                  className="text-sm leading-relaxed font-[450] text-[#7A736C] dark:text-[#9E9893]"
                />
              </>
            ) : (
              <>
                {col.heading && (
                  <h4 className="text-lg font-semibold [overflow-wrap:anywhere] whitespace-pre-wrap text-[#1A1A1A] dark:text-[#F0EDE7]">
                    {col.heading}
                  </h4>
                )}
                {col.body && (
                  <p className="text-sm leading-relaxed font-[450] [overflow-wrap:anywhere] text-[#7A736C] dark:text-[#9E9893]">
                    {col.body}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

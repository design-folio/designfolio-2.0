import { Plus, Trash2 } from "lucide-react";
import EditableText from "@/components/project/EditableText";

const DEFAULT_ITEMS = [
  { title: "", detail: "" },
  { title: "", detail: "" },
  { title: "", detail: "" },
];

export default function TextHighlightsSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || { items: DEFAULT_ITEMS };
  const items = content.items?.length ? content.items : DEFAULT_ITEMS;

  const updateItem = (index, patch) => {
    onChange({
      ...content,
      items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const addItem = () => {
    onChange({ ...content, items: [...items, { title: "", detail: "" }] });
  };

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange({ ...content, items: next.length ? next : [{ title: "", detail: "" }] });
  };

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="group/card relative rounded-xl border border-black/[0.08] bg-black/[0.02] p-5 dark:border-white/[0.08] dark:bg-white/[0.02]"
          >
            {editable && (
              <button
                onClick={() => removeItem(i)}
                className="absolute top-3 right-3 text-[#7A736C] opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
              >
                <Trash2 size={13} />
              </button>
            )}
            {editable ? (
              <>
                <EditableText
                  value={item.title}
                  onChange={(v) => updateItem(i, { title: v })}
                  placeholder="Title…"
                  tag="div"
                  className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]"
                />
                <EditableText
                  value={item.detail}
                  onChange={(v) => updateItem(i, { detail: v })}
                  placeholder="Detail…"
                  tag="div"
                  className="mt-1 text-sm text-[#7A736C] dark:text-[#9E9893]"
                />
              </>
            ) : (
              <>
                {item.title && (
                  <p className="text-base font-semibold whitespace-pre-wrap text-[#1A1A1A] dark:text-[#F0EDE7]">
                    {item.title}
                  </p>
                )}
                {item.detail && (
                  <p className="mt-1 text-sm text-[#7A736C] dark:text-[#9E9893]">{item.detail}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {editable && (
        <button
          onClick={addItem}
          className="mt-4 flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
        >
          <Plus size={15} /> Add card
        </button>
      )}
    </div>
  );
}

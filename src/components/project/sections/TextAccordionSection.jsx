import { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import EditableText from "@/components/project/EditableText";

function AccordionItem({ item, index, editable, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);

  if (editable) {
    return (
      <div className="group/item border-b border-black/10 py-4 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <EditableText
            value={item.question}
            onChange={(v) => onUpdate({ ...item, question: v })}
            placeholder="Question…"
            tag="div"
            className="min-w-0 flex-1 text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7]"
          />
          <button
            onClick={onDelete}
            className="mt-0.5 flex-shrink-0 text-[#7A736C] opacity-0 transition-opacity group-hover/item:opacity-100 hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <EditableText
          value={item.answer}
          onChange={(v) => onUpdate({ ...item, answer: v })}
          placeholder="Answer…"
          tag="div"
          className="mt-2 text-sm leading-relaxed font-[450] text-[#7A736C] dark:text-[#9E9893]"
        />
      </div>
    );
  }

  return (
    <div className="border-b border-black/10 dark:border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="min-w-0 flex-1 text-base font-medium [overflow-wrap:anywhere] text-[#1A1A1A] dark:text-[#F0EDE7]">
          {item.question}
        </span>
        <ChevronRight
          size={16}
          className={`flex-shrink-0 text-[#7A736C] transition-transform dark:text-[#9E9893] ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed font-[450] [overflow-wrap:anywhere] text-[#7A736C] dark:text-[#9E9893]">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function TextAccordionSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || { heading: "", items: [{ question: "", answer: "" }] };
  const { heading, items } = content;

  const updateItem = (index, updated) => {
    onChange({ ...content, items: items.map((item, i) => (i === index ? updated : item)) });
  };

  const addItem = () => {
    onChange({ ...content, items: [...items, { question: "", answer: "" }] });
  };

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange({ ...content, items: next.length ? next : [{ question: "", answer: "" }] });
  };

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      <div className="max-w-[640px]">
        {editable ? (
          <EditableText
            value={heading}
            onChange={(v) => onChange({ ...content, heading: v })}
            placeholder="Section heading…"
            tag="div"
            className="mb-6 text-xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]"
          />
        ) : heading ? (
          <h3 className="mb-6 text-xl font-semibold whitespace-pre-wrap text-[#1A1A1A] dark:text-[#F0EDE7]">
            {heading}
          </h3>
        ) : null}

        <div>
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              index={i}
              editable={editable}
              onUpdate={(updated) => updateItem(i, updated)}
              onDelete={() => removeItem(i)}
            />
          ))}
        </div>

        {editable && (
          <button
            onClick={addItem}
            className="mt-4 flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          >
            <Plus size={15} /> Add item
          </button>
        )}
      </div>
    </div>
  );
}

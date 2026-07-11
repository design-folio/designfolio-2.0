import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Loader2, Upload } from "lucide-react";
import { uploadSectionImage } from "@/components/project/uploadSectionImage";
import { normalizeEditableEmpty, handlePlainTextPaste } from "@/components/project/editableUtils";
import ImageLightbox from "@/components/project/ImageLightbox";

function ImageUploadSlot({ url, onUpload }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { key, url: signedUrl } = await uploadSectionImage(file);
      onUpload({ key, url: signedUrl });
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="group/img relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl"
      onClick={() => !uploading && inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {uploading ? (
        <div className="flex h-full w-full items-center justify-center bg-[#F0EDE7] dark:bg-[#2A2520]">
          <Loader2 size={20} className="animate-spin text-[#7A736C] dark:text-[#9E9893]" />
        </div>
      ) : url ? (
        <>
          <img src={url} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover/img:bg-black/30">
            <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover/img:opacity-100">
              Replace image
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#C5BEB8] bg-[#F0EDE7] transition-colors group-hover/img:border-[#9E9893] dark:border-[#3A3530] dark:bg-[#2A2520] dark:group-hover/img:border-[#5A5450]">
          <Upload size={20} className="text-[#B5AFA5] dark:text-[#5A5450]" />
          <span className="text-[13px] font-medium text-[#9E9893] dark:text-[#5A5450]">
            Click or drop image
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function CaptionEditor({ value, onChange }) {
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
      data-placeholder="Add a caption…"
      className="block cursor-text text-center text-[13px] leading-snug [overflow-wrap:anywhere] text-[#9E9893] outline-none dark:text-[#6A6460]"
      onInput={(e) => normalizeEditableEmpty(e.currentTarget)}
      onPaste={handlePlainTextPaste}
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export default function CarouselSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || {
    items: [
      { url: null, key: null, caption: "" },
      { url: null, key: null, caption: "" },
    ],
  };
  const items = content.items?.length ? content.items : [{ url: null, key: null, caption: "" }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const total = items.length;
  const safeIndex = Math.min(activeIndex, total - 1);
  const current = items[safeIndex];

  const updateItem = (index, patch) => {
    onChange({
      ...content,
      items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const addItem = () => {
    const next = [...items, { url: null, key: null, caption: "" }];
    onChange({ ...content, items: next });
    setActiveIndex(next.length - 1);
  };

  const removeItem = (index) => {
    if (total <= 1) return;
    const next = items.filter((_, i) => i !== index);
    onChange({ ...content, items: next });
    setActiveIndex(Math.min(safeIndex, next.length - 1));
  };

  const prev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const next = () => setActiveIndex((i) => (i + 1) % total);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-10 md:px-10">
      <div className="relative flex items-center gap-4">
        {/* Prev */}
        <button
          onClick={prev}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.10] bg-white text-[#1A1A1A] shadow-sm transition-colors hover:bg-[#F0EDE7] dark:border-white/[0.10] dark:bg-[#232323] dark:text-[#F0EDE7] dark:hover:bg-[#2A2A2A]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Image + caption */}
        <div className="flex-1">
          {editable ? (
            <ImageUploadSlot
              key={safeIndex}
              url={current?.url}
              onUpload={({ key, url }) => updateItem(safeIndex, { key, url })}
            />
          ) : (
            <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#F0EDE7] dark:bg-[#2A2520]">
              {current?.url && (
                <img
                  src={current.url}
                  alt={current?.caption || ""}
                  className="h-full w-full cursor-pointer object-cover"
                  onClick={() => setLightboxSrc(current.url)}
                />
              )}
            </div>
          )}
          <div className="mt-3 text-center">
            {editable ? (
              <CaptionEditor
                key={safeIndex}
                value={current?.caption ?? ""}
                onChange={(v) => updateItem(safeIndex, { caption: v })}
              />
            ) : current?.caption ? (
              <p className="text-[13px] leading-snug [overflow-wrap:anywhere] text-[#9E9893] dark:text-[#6A6460]">
                {current.caption}
              </p>
            ) : null}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.10] bg-white text-[#1A1A1A] shadow-sm transition-colors hover:bg-[#F0EDE7] dark:border-white/[0.10] dark:bg-[#232323] dark:text-[#F0EDE7] dark:hover:bg-[#2A2A2A]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-full transition-all duration-200 ${i === safeIndex ? "h-2 w-4 bg-[#1A1A1A] dark:bg-[#F0EDE7]" : "h-2 w-2 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40"}`}
          />
        ))}
      </div>

      {/* Add / Remove — editor only */}
      {editable && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          >
            <Plus size={14} /> Add slide
          </button>
          {total > 1 && (
            <button
              onClick={() => removeItem(safeIndex)}
              className="flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-red-500 dark:text-[#9E9893]"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
      )}
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}

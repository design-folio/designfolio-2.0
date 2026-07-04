import { useRef, useState, useEffect } from "react";
import { Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { uploadSectionImage } from "@/components/project/uploadSectionImage";

const SPEED = 0.25; // px per frame — slow, cinematic
const GAP = 20; // must match gap-5 (20px)
const COPIES = 6; // enough copies to always fill the viewport without gaps

function ScrollCard({ item, idx, editable, onUpload, onDelete }) {
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

  if (!editable) {
    return item.url ? (
      <div className="w-[380px] shrink-0 overflow-hidden rounded-xl">
        <img src={item.url} alt="" className="block h-auto w-[380px]" />
      </div>
    ) : null;
  }

  return (
    <div className="group/slot relative shrink-0">
      {item.url ? (
        <div
          className="group/img relative w-[380px] cursor-pointer overflow-hidden rounded-xl"
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <img src={item.url} alt="" className="block h-auto w-[380px]" />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover/img:bg-black/30">
              <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover/img:opacity-100">
                Replace image
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex h-60 w-[380px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#C5BEB8] bg-[#F0EDE7] transition-colors hover:border-[#9E9893] dark:border-[#3A3530] dark:bg-[#2A2520] dark:hover:border-[#5A5450]"
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-[#B5AFA5] dark:text-[#5A5450]" />
          ) : (
            <>
              <Upload size={20} className="text-[#B5AFA5] dark:text-[#5A5450]" />
              <span className="text-[13px] font-medium text-[#9E9893] dark:text-[#5A5450]">
                Click or drop image
              </span>
            </>
          )}
        </div>
      )}
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-[#7A736C] opacity-0 shadow-sm transition-opacity group-hover/slot:opacity-100 hover:text-red-500 dark:border-white/10 dark:bg-[#2A2520]"
      >
        <Trash2 size={11} />
      </button>
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

export default function ScrollGallerySection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || {
    items: [
      { url: null, key: null },
      { url: null, key: null },
      { url: null, key: null },
    ],
  };
  const items = content.items?.length ? content.items : [{ url: null, key: null }];

  const trackRef = useRef(null);
  const firstCopyRef = useRef(null);
  const xRef = useRef(0);
  const pausedRef = useRef(false);
  const animRef = useRef(0);

  const viewItems = items.filter((i) => i.url);
  const urlCount = viewItems.length;

  const updateItem = (index, patch) => {
    onChange({
      ...content,
      items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const addItem = () => {
    onChange({ ...content, items: [...items, { url: null, key: null }] });
  };

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index);
    onChange({ ...content, items: next.length ? next : [{ url: null, key: null }] });
  };

  // RAF-based infinite scroll — editor and view/preview
  useEffect(() => {
    if (urlCount === 0) return;
    const tick = () => {
      if (!pausedRef.current && trackRef.current && firstCopyRef.current) {
        xRef.current -= SPEED;
        const boundary = firstCopyRef.current.offsetWidth + GAP;
        if (xRef.current <= -boundary) xRef.current = 0;
        trackRef.current.style.transform = `translateX(${xRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [urlCount]);

  return (
    <div className="-mx-6 py-10">
      {/* Overflow + edge fades */}
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)",
        }}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        {/* Transform track */}
        <div ref={trackRef} className="flex w-max gap-5 px-6" style={{ willChange: "transform" }}>
          {editable ? (
            /* Editor: editable first copy + read-only mirrors for seamless loop */
            <>
              <div ref={firstCopyRef} className="flex gap-5">
                {items.map((item, i) => (
                  <ScrollCard
                    key={i}
                    item={item}
                    idx={i}
                    editable={editable}
                    onUpload={(patch) => updateItem(i, patch)}
                    onDelete={() => removeItem(i)}
                  />
                ))}
              </div>
              {viewItems.length > 0 &&
                Array.from({ length: COPIES - 1 }, (_, copyIdx) => (
                  <div key={copyIdx} className="flex gap-5" aria-hidden="true">
                    {viewItems.map((item, i) => (
                      <div key={i} className="w-[380px] shrink-0 overflow-hidden rounded-xl">
                        <img src={item.url} alt="" className="block h-auto w-[380px]" />
                      </div>
                    ))}
                  </div>
                ))}
            </>
          ) : (
            /* View mode: COPIES identical copies for a seamless, gap-free loop */
            viewItems.length > 0 &&
            Array.from({ length: COPIES }, (_, copyIdx) => (
              <div
                key={copyIdx}
                ref={copyIdx === 0 ? firstCopyRef : undefined}
                className="flex gap-5"
                aria-hidden={copyIdx > 0 ? "true" : undefined}
              >
                {viewItems.map((item, i) => (
                  <div key={i} className="w-[380px] shrink-0 overflow-hidden rounded-xl">
                    <img src={item.url} alt="" className="block h-auto w-[380px]" />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add image — editor only */}
      {editable && (
        <div className="mt-5 flex justify-center px-6">
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          >
            <Plus size={15} /> Add image
          </button>
        </div>
      )}
    </div>
  );
}

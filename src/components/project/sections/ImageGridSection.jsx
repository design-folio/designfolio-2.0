import { useRef, useEffect, useState } from "react";
import { Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { uploadSectionImage } from "@/components/project/uploadSectionImage";
import { normalizeEditableEmpty, handlePlainTextPaste } from "@/components/project/editableUtils";
import ResizeHandle from "@/components/project/ResizeHandle";
import ImageLightbox from "@/components/project/ImageLightbox";

function ImageSlot({
  url,
  caption,
  width,
  height,
  onUpload,
  onCaptionChange,
  onDelete,
  onResize,
  onImageClick,
  editable,
}) {
  const inputRef = useRef(null);
  const captionRef = useRef(null);
  const boxRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [handleHovered, setHandleHovered] = useState(false);

  const sizeStyle = { maxWidth: "100%" };
  if (width != null) sizeStyle.width = width;
  if (height != null) sizeStyle.height = height;
  else sizeStyle.aspectRatio = "4/3";

  useEffect(() => {
    if (captionRef.current) captionRef.current.innerText = caption || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { key, url: signedUrl } = await uploadSectionImage(file);
      onUpload({ key, url: signedUrl });
    } catch {
      // silent — user can retry
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={boxRef}
        className="relative"
        style={sizeStyle}
        onMouseEnter={() => editable && url && setHovered(true)}
        onMouseLeave={() => !resizing && setHovered(false)}
      >
        <div
          className={[
            "relative h-full w-full overflow-hidden rounded-xl",
            !url
              ? "border border-dashed border-black/20 bg-black/[0.03] dark:border-white/20 dark:bg-white/[0.03]"
              : "",
            editable ? "group/slot cursor-pointer" : "",
            !editable && url ? "cursor-pointer" : "",
          ].join(" ")}
          style={{
            boxShadow:
              handleHovered || resizing
                ? resizing
                  ? "0 0 0 2px rgba(99,102,241,0.45), 0 0 40px rgba(99,102,241,0.1)"
                  : "0 0 0 1.5px rgba(99,102,241,0.28), 0 0 24px rgba(99,102,241,0.08)"
                : undefined,
            transition: "box-shadow 0.2s ease",
          }}
          onClick={() => {
            if (editable) {
              if (!uploading) inputRef.current?.click();
            } else if (url) {
              onImageClick?.(url);
            }
          }}
          onDrop={(e) => {
            if (!editable) return;
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => editable && e.preventDefault()}
        >
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.03]">
              <Loader2 size={20} className="animate-spin text-[#7A736C] dark:text-[#9E9893]" />
            </div>
          ) : url ? (
            <img src={url} alt={caption || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#7A736C] dark:text-[#9E9893]">
              <Upload size={20} className="opacity-50" />
              <span className="text-xs opacity-50">Upload image</span>
            </div>
          )}
          {editable && !uploading && (
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover/slot:bg-black/20">
                <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover/slot:opacity-100">
                  <Upload size={11} /> Change photo
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover/slot:opacity-100 hover:bg-black/80"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
          {editable && (
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          )}
        </div>
        {editable && url && !uploading && (
          <>
            <ResizeHandle
              axis="height"
              show={hovered}
              getSize={() => ({
                width: boxRef.current?.offsetWidth ?? 0,
                height: boxRef.current?.offsetHeight ?? 0,
              })}
              min={120}
              max={1200}
              onResizingChange={setResizing}
              onHoverChange={setHandleHovered}
              onChange={onResize}
            />
            <ResizeHandle
              axis="width"
              show={hovered}
              getSize={() => ({
                width: boxRef.current?.offsetWidth ?? 0,
                height: boxRef.current?.offsetHeight ?? 0,
              })}
              min={120}
              max={() => boxRef.current?.parentElement?.offsetWidth ?? 2000}
              onResizingChange={setResizing}
              onHoverChange={setHandleHovered}
              onChange={onResize}
            />
          </>
        )}
      </div>
      {editable ? (
        <span
          ref={captionRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Caption…"
          className="block cursor-text text-sm [overflow-wrap:anywhere] text-[#7A736C] outline-none dark:text-[#9E9893]"
          onInput={(e) => normalizeEditableEmpty(e.currentTarget)}
          onPaste={handlePlainTextPaste}
          onBlur={(e) => onCaptionChange(e.currentTarget.textContent ?? "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      ) : caption ? (
        <p className="text-sm [overflow-wrap:anywhere] text-[#7A736C] dark:text-[#9E9893]">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export default function ImageGridSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const content = section.content || {
    columns: 2,
    images: [
      { url: null, key: null, caption: "" },
      { url: null, key: null, caption: "" },
    ],
  };
  const { columns, images } = content;

  const updateImage = (index, patch) => {
    const next = images.map((img, i) => (i === index ? { ...img, ...patch } : img));
    onChange({ ...content, images: next });
  };

  const addImage = () => {
    onChange({ ...content, images: [...images, { url: null, key: null, caption: "" }] });
  };

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index);
    onChange({ ...content, images: next.length ? next : [{ url: null, key: null, caption: "" }] });
  };

  const setColumns = (cols) => {
    let next = [...images];
    while (next.length < cols) next.push({ url: null, key: null, caption: "" });
    onChange({ ...content, columns: cols, images: next });
  };

  const displayImages = editable ? images : images.filter((img) => img.url);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      {editable && (
        <div className="mb-4 flex items-center gap-2">
          {[2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setColumns(n)}
              className={[
                "cursor-pointer rounded-lg px-3 py-1 text-sm font-medium transition-colors",
                columns === n
                  ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
                  : "bg-black/5 text-[#7A736C] hover:bg-black/10 dark:bg-white/5 dark:text-[#9E9893] dark:hover:bg-white/10",
              ].join(" ")}
            >
              {n} col
            </button>
          ))}
        </div>
      )}
      <div
        className={`grid gap-4 ${
          displayImages.length === 1
            ? "grid-cols-1 justify-items-center"
            : columns === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {displayImages.map((img, i) => (
          <div
            key={i}
            className={
              displayImages.length === 1
                ? columns === 3
                  ? "w-full sm:w-1/3"
                  : "w-full sm:w-1/2"
                : "w-full"
            }
          >
            <ImageSlot
              url={img.url}
              caption={img.caption}
              width={img.width ?? null}
              height={img.height ?? null}
              editable={editable}
              onUpload={({ key, url }) => updateImage(i, { key, url })}
              onCaptionChange={(caption) => updateImage(i, { caption })}
              onResize={(patch) => updateImage(i, patch)}
              onDelete={() => removeImage(i)}
              onImageClick={setLightboxSrc}
            />
          </div>
        ))}
      </div>
      {editable && (
        <button
          onClick={addImage}
          className="mt-4 flex items-center gap-1.5 text-sm text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
        >
          <Plus size={15} /> Add image
        </button>
      )}
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}

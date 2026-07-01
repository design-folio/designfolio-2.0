import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import EditableText from "@/components/project/EditableText";
import { uploadSectionImage } from "@/components/project/uploadSectionImage";

const LAYOUTS = ["image-left", "image-right", "image-top"];
const LAYOUT_LABELS = { "image-left": "Left", "image-right": "Right", "image-top": "Top" };

function ImageSlot({ url, onUpload, editable }) {
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
      className={[
        "group/img relative flex-shrink-0 overflow-hidden rounded-xl",
        !url
          ? "border border-dashed border-black/20 bg-black/[0.03] dark:border-white/20 dark:bg-white/[0.03]"
          : "",
        editable ? "cursor-pointer" : "",
      ].join(" ")}
      style={{ minHeight: 200 }}
      onClick={() => editable && !uploading && inputRef.current?.click()}
      onDrop={(e) => {
        if (!editable) return;
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      onDragOver={(e) => editable && e.preventDefault()}
    >
      {uploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#7A736C] dark:text-[#9E9893]" />
        </div>
      ) : url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#7A736C] dark:text-[#9E9893]">
          <Upload size={20} className="opacity-50" />
          <span className="text-xs opacity-50">Upload image</span>
        </div>
      )}
      {editable && url && !uploading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover/img:bg-black/20">
          <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover/img:opacity-100">
            <Upload size={11} /> Change photo
          </span>
        </div>
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
  );
}

export default function ImageTextSection({ section, onChange, mode }) {
  const editable = mode === "editor";
  const content = section.content || {
    layout: "image-left",
    image: { url: null, key: null },
    heading: "",
    body: "",
  };
  const { layout, image, heading, body } = content;

  const isTop = layout === "image-top";

  const textBlock = (
    <div className="flex flex-col justify-center gap-3">
      {editable ? (
        <>
          <EditableText
            value={heading}
            onChange={(v) => onChange({ ...content, heading: v })}
            placeholder="Heading…"
            tag="div"
            className="text-2xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]"
          />
          <EditableText
            value={body}
            onChange={(v) => onChange({ ...content, body: v })}
            placeholder="Body text…"
            tag="div"
            className="text-base leading-relaxed text-[#7A736C] dark:text-[#9E9893]"
          />
        </>
      ) : (
        <>
          {heading && (
            <h3 className="text-2xl font-semibold whitespace-pre-wrap text-[#1A1A1A] dark:text-[#F0EDE7]">
              {heading}
            </h3>
          )}
          {body && (
            <p className="text-base leading-relaxed text-[#7A736C] dark:text-[#9E9893]">{body}</p>
          )}
        </>
      )}
    </div>
  );

  const imageEl = (
    <ImageSlot
      url={image?.url ?? null}
      editable={editable}
      onUpload={({ key, url }) => onChange({ ...content, image: { key, url } })}
    />
  );

  return (
    <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
      {editable && (
        <div className="mb-4 flex items-center gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ ...content, layout: l })}
              className={[
                "cursor-pointer rounded-lg px-3 py-1 text-sm font-medium transition-colors",
                layout === l
                  ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
                  : "bg-black/5 text-[#7A736C] hover:bg-black/10 dark:bg-white/5 dark:text-[#9E9893] dark:hover:bg-white/10",
              ].join(" ")}
            >
              {LAYOUT_LABELS[l]}
            </button>
          ))}
        </div>
      )}
      {isTop ? (
        <div className="flex flex-col gap-6">
          <div className="w-full">{imageEl}</div>
          {textBlock}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center gap-8 md:flex-row ${layout === "image-right" ? "md:flex-row-reverse" : ""}`}
        >
          <div className="w-full md:w-[40%]">{imageEl}</div>
          <div className="w-full md:w-[60%]">{textBlock}</div>
        </div>
      )}
    </div>
  );
}

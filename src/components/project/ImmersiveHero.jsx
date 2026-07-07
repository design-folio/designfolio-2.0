import { useRef, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, useAnimation } from "motion/react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_META_FIELDS, getMetaValue } from "@/lib/constant";
import { TextEffect } from "@/components/ui/text-effect";
import EditableField from "./EditableField";
import NavRow from "./NavRow";
import HeroUploadOverlay from "./HeroUploadOverlay";
import ImmersiveMeta from "./ImmersiveMeta";

// Shared title typography — used by both the blur-in animation and the
// editable field so they stay pixel-identical.
const IMMERSIVE_TITLE_CLS =
  "mb-8 text-[36px] leading-[1.25] font-semibold tracking-[-0.02em] text-white";

export default function ImmersiveHero({
  project,
  onChange,
  onMetaChange,
  mode,
  onImageUpload,
  titleAnimDone,
  setTitleAnimDone,
  navRowProps,
}) {
  const isEditable = mode === "editor";
  const imageUrl = project?.thumbnail?.url || null;
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      onImageUpload?.(file);
    },
    [onImageUpload]
  );

  // Slow scale-in of the cover on mount (and whenever the image changes).
  const imgControls = useAnimation();
  useEffect(() => {
    imgControls.set({ scale: 1.06 });
    imgControls.start({ scale: 1, transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] } });
  }, [imageUrl]);

  // Parallax
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 600], ["0%", "30%"]);

  // Editor shows all fields; public/preview only shows filled fields.
  const immersiveMeta = isEditable
    ? DEFAULT_META_FIELDS
    : DEFAULT_META_FIELDS.filter(({ index }) => getMetaValue(project, index).trim() !== "");

  return (
    <motion.div
      key="immersive"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="group/thumb relative w-full overflow-hidden"
        style={{ minHeight: "92vh", ...(isEditable ? { cursor: "pointer" } : {}) }}
        onClick={isEditable ? () => inputRef.current?.click() : undefined}
        onDrop={
          isEditable
            ? (e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files[0]);
              }
            : undefined
        }
        onDragOver={isEditable ? (e) => e.preventDefault() : undefined}
      >
        {/* Full-bleed image with parallax */}
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={project?.title || "Project cover"}
            className="absolute w-full object-cover"
            style={{ y: heroImageY, height: "130%", top: "-15%" }}
            animate={imgControls}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
            {isEditable && (
              <span className="flex flex-col items-center gap-3 text-white/40">
                <Upload size={28} />
                <span className="text-[13px] font-medium tracking-wide">Upload cover image</span>
              </span>
            )}
          </div>
        )}

        {/* Dark overlays */}
        <div className="pointer-events-none absolute inset-0 bg-black/12" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-linear-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-black/75 via-black/30 to-transparent" />

        {/* Grain overlay — subtle film texture over the cover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: "url('/assets/backgrounds/grainsnow.avif')",
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Upload overlay (editor only) */}
        {isEditable && <HeroUploadOverlay inputRef={inputRef} onFile={handleFile} />}

        {/* Nav */}
        <div className="pointer-events-none relative z-20 flex justify-center pt-7">
          <div className="pointer-events-auto w-full" onClick={(e) => e.stopPropagation()}>
            {/* Editor gets full width so all controls clear the centered builder pill;
                public/preview stays aligned to the 1100px title column. */}
            <NavRow
              dark
              containerClass={isEditable ? "px-6 md:px-12" : "max-w-[1100px] px-6 md:px-12"}
              {...navRowProps}
            />
          </div>
        </div>

        {/* Title + meta at bottom */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex justify-center pb-10">
          <div
            className="pointer-events-auto w-full max-w-[1100px] px-6 md:px-12"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditable ? (
              titleAnimDone ? (
                <EditableField
                  value={project?.title ?? ""}
                  onChange={(v) => onChange?.({ title: v })}
                  tag="h1"
                  placeholder="Project title…"
                  className={cn(
                    IMMERSIVE_TITLE_CLS,
                    "[&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
                  )}
                />
              ) : (
                <TextEffect
                  as="h1"
                  preset="blur"
                  per="word"
                  delay={0.1}
                  className={cn(IMMERSIVE_TITLE_CLS, "[overflow-wrap:anywhere]")}
                  onAnimationComplete={() => setTitleAnimDone(true)}
                >
                  {project?.title || "Untitled Project"}
                </TextEffect>
              )
            ) : (
              <TextEffect
                as="h1"
                preset="blur"
                per="word"
                delay={0.1}
                className="mb-8 text-[36px] leading-[1.05] font-bold tracking-[-0.02em] [overflow-wrap:anywhere] text-white md:text-[52px]"
              >
                {project?.title || "Untitled Project"}
              </TextEffect>
            )}

            <ImmersiveMeta
              project={project}
              onMetaChange={onMetaChange}
              isEditable={isEditable}
              meta={immersiveMeta}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

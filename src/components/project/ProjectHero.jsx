import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useAnimation } from "motion/react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectMetaGrid, { hasProjectMeta, metaColsClass } from "./ProjectMetaGrid";
import { DEFAULT_META_FIELDS, getMetaLabel, getMetaValue } from "@/lib/constant";
import ResizeHandle from "@/components/project/ResizeHandle";
import { TextEffect } from "@/components/ui/text-effect";
import EditableField from "./EditableField";
import NavRow from "./NavRow";

// ─── Shared title typography — change once, applies to animation + editable ───
const IMMERSIVE_TITLE_CLS =
  "mb-8 text-[36px] leading-[1.25] font-semibold tracking-[-0.02em] text-white";
const EDITORIAL_TITLE_CLS =
  "mb-5 text-[38px] leading-[1.25] font-semibold tracking-[-0.02em] md:text-[36px]";

export default function ProjectHero({
  project,
  onChange,
  onMetaChange,
  mode,
  onImageUpload,
  onBack,
  onAnalyze,
  onWorkClick,
  resumeUrl,
  analyzeStatus,
  analyzeButtonLabel,
  analyzeTooltipMessage,
  isAnalyzeDisabled,
  isAnalyzing,
}) {
  const inputRef = useRef(null);
  const thumbnailImgRef = useRef(null);
  const isEditable = mode === "editor";
  const imageUrl = project?.thumbnail?.url || null;
  const [titleAnimDone, setTitleAnimDone] = useState(false);

  // Layout values come from project (persisted), not local state
  const heroView = project?.heroView ?? "editorial";
  const thumbnailWidth = project?.thumbnailWidth ?? "contained";
  const thumbnailHeight = project?.thumbnailHeight ?? null;

  // These are transient UI states — no need to persist
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [showHeightHandle, setShowHeightHandle] = useState(false);
  const [heightHandleHovered, setHeightHandleHovered] = useState(false);

  const imgControls = useAnimation();
  useEffect(() => {
    if (heroView !== "immersive") return;
    imgControls.set({ scale: 1.06 });
    imgControls.start({ scale: 1, transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] } });
  }, [heroView, imageUrl]);

  // Parallax (must be at top level — not inside conditional)
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 600], ["0%", "30%"]);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      onImageUpload?.(file);
    },
    [onImageUpload]
  );

  const setHeroView = useCallback((v) => onChange?.({ heroView: v }), [onChange]);
  const setThumbnailWidth = useCallback((v) => onChange?.({ thumbnailWidth: v }), [onChange]);
  const setThumbnailHeight = useCallback((v) => onChange?.({ thumbnailHeight: v }), [onChange]);

  // ── Upload interactions — editor only ─────────────────────────────────────
  const thumbUploadProps = isEditable
    ? {
        onClick: () => inputRef.current?.click(),
        onDrop: (e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        },
        onDragOver: (e) => e.preventDefault(),
        style: { cursor: "pointer" },
      }
    : {};

  const hoverOverlay = isEditable && (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-all group-hover/thumb:bg-black/25">
      <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover/thumb:opacity-100">
        <Upload size={11} /> Change photo
      </span>
    </div>
  );

  const fileInput = isEditable && (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => handleFile(e.target.files?.[0])}
    />
  );

  // ── Meta columns (immersive bottom grid) ─────────────────────────────────
  // Editor shows all fields; public/preview only shows filled fields.
  const immersiveMeta = isEditable
    ? DEFAULT_META_FIELDS
    : DEFAULT_META_FIELDS.filter(({ index }) => getMetaValue(project, index).trim() !== "");

  const navRowProps = {
    mode,
    heroView,
    setHeroView,
    onBack: onBack || (() => typeof window !== "undefined" && window.history.back()),
    onWorkClick: onWorkClick || (() => {}),
    resumeUrl,
    onAnalyze,
    project,
    analyzeStatus,
    analyzeButtonLabel,
    analyzeTooltipMessage,
    isAnalyzeDisabled,
    isAnalyzing,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {heroView === "immersive" ? (
        // ──────────────────────────────────────────────────────────────────────
        // IMMERSIVE
        // ──────────────────────────────────────────────────────────────────────
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
                    <span className="text-[13px] font-medium tracking-wide">
                      Upload cover image
                    </span>
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
            {hoverOverlay}
            {fileInput}

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

                {immersiveMeta.length > 0 && (
                  <div className={cn("grid gap-y-5", metaColsClass(immersiveMeta.length))}>
                    {immersiveMeta.map(({ index, defaultLabel }) => {
                      const label = getMetaLabel(project, index);
                      const value = getMetaValue(project, index);
                      return (
                        <div key={index} className="flex min-w-0 flex-col gap-1">
                          {isEditable ? (
                            <EditableField
                              value={label}
                              onChange={(v) => onMetaChange?.(index, { label: v.trim() || null })}
                              tag="span"
                              placeholder={defaultLabel}
                              className="text-[11px] font-medium tracking-widest text-white/50 uppercase [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
                            />
                          ) : (
                            <span className="text-[11px] font-medium tracking-widest text-white/50 uppercase">
                              {label}
                            </span>
                          )}
                          {isEditable ? (
                            <EditableField
                              value={value}
                              onChange={(v) => onMetaChange?.(index, { value: v })}
                              tag="span"
                              placeholder="Write here…"
                              className="text-[15px] leading-snug font-semibold text-white [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
                            />
                          ) : (
                            <span className="text-[15px] leading-snug font-semibold [overflow-wrap:anywhere] text-white">
                              {value}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        // ──────────────────────────────────────────────────────────────────────
        // EDITORIAL
        // ──────────────────────────────────────────────────────────────────────
        <motion.div
          key="editorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-50 flex justify-center border-b border-black/5 bg-white/90 backdrop-blur-md dark:border-white/5 dark:bg-[#1A1A1A]/90">
            <div className="w-full py-4">
              {/* Editor gets full width; public/preview stays at 880px. */}
              <NavRow dark={false} containerClass="max-w-[880px] px-6 md:px-10" {...navRowProps} />
            </div>
          </div>

          {/* Title + description */}
          <div className="mx-auto w-full max-w-[880px] px-6 md:px-10">
            <div className="pt-14 pb-10">
              {isEditable ? (
                <>
                  {titleAnimDone ? (
                    <EditableField
                      value={project?.title ?? ""}
                      onChange={(v) => onChange?.({ title: v })}
                      tag="h1"
                      placeholder="Project title…"
                      className={cn(
                        EDITORIAL_TITLE_CLS,
                        "text-[#1A1A1A] focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#F0EDE7] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
                      )}
                    />
                  ) : (
                    <TextEffect
                      as="h1"
                      preset="blur"
                      per="word"
                      delay={0.05}
                      className={cn(
                        EDITORIAL_TITLE_CLS,
                        "[overflow-wrap:anywhere] text-[#1A1A1A] dark:text-[#F0EDE7]"
                      )}
                      onAnimationComplete={() => setTitleAnimDone(true)}
                    >
                      {project?.title || "Untitled Project"}
                    </TextEffect>
                  )}
                  <EditableField
                    value={project?.description ?? ""}
                    onChange={(v) => onChange?.({ description: v })}
                    tag="p"
                    placeholder="Short description…"
                    className="max-w-2xl text-[18px] leading-relaxed font-[450] text-[#7A736C] focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 dark:text-[#B5AFA5] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
                  />
                </>
              ) : (
                <>
                  <TextEffect
                    as="h1"
                    preset="blur"
                    per="word"
                    delay={0.03}
                    className={cn(
                      EDITORIAL_TITLE_CLS,
                      "[overflow-wrap:anywhere] text-[#1A1A1A] dark:text-[#F0EDE7]"
                    )}
                  >
                    {project?.title || "Untitled Project"}
                  </TextEffect>
                  {project?.description && (
                    <p className="max-w-2xl text-[18px] leading-relaxed font-[450] [overflow-wrap:anywhere] text-[#7A736C] dark:text-[#B5AFA5]">
                      {project.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Thumbnail with width + height controls */}
          <motion.div
            className="group/widthpicker relative mx-auto"
            animate={{ maxWidth: thumbnailWidth === "full" ? 10000 : 880 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Width toggle — slides in from left on hover, editor only */}
            {isEditable && (
              <div className="pointer-events-none absolute top-1/2 left-3 z-30 -translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover/widthpicker:pointer-events-auto group-hover/widthpicker:translate-x-0 group-hover/widthpicker:opacity-100">
                <div className="flex flex-col gap-0.5 rounded-xl border border-black/[0.06] bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#2A2520]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnailWidth("full");
                    }}
                    title="Full width"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      thumbnailWidth === "full"
                        ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
                        : "text-[#7A736C] hover:bg-black/5 dark:text-[#9E9893] dark:hover:bg-white/5"
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="4" width="12" height="6" rx="1" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnailWidth("contained");
                    }}
                    title="Contained width"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      thumbnailWidth === "contained"
                        ? "bg-[#1A1A1A] text-white dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
                        : "text-[#7A736C] hover:bg-black/5 dark:text-[#9E9893] dark:hover:bg-white/5"
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="3.5" y="4" width="7" height="6" rx="1" fill="currentColor" />
                      <rect
                        x="1"
                        y="5"
                        width="1.5"
                        height="4"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.35"
                      />
                      <rect
                        x="11.5"
                        y="5"
                        width="1.5"
                        height="4"
                        rx="0.5"
                        fill="currentColor"
                        opacity="0.35"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Image area + resize handle */}
            <div
              className="relative"
              onMouseEnter={() => isEditable && setShowHeightHandle(true)}
              onMouseLeave={() => {
                if (!isResizingHeight) setShowHeightHandle(false);
              }}
            >
              {/* Border-radius + overflow clip layer */}
              <motion.div
                animate={{ borderRadius: thumbnailWidth === "contained" ? 16 : 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  overflow: "hidden",
                  boxShadow:
                    heightHandleHovered || isResizingHeight
                      ? isResizingHeight
                        ? "0 0 0 2px rgba(99,102,241,0.45), 0 0 40px rgba(99,102,241,0.1)"
                        : "0 0 0 1.5px rgba(99,102,241,0.28), 0 0 24px rgba(99,102,241,0.08)"
                      : undefined,
                  transition: "box-shadow 0.2s ease",
                }}
              >
                {/* Upload wrapper (editor) or plain div (public/preview) */}
                <div
                  className={isEditable ? "group/thumb relative w-full cursor-pointer" : "w-full"}
                  {...(isEditable ? thumbUploadProps : {})}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  >
                    <div
                      ref={thumbnailImgRef}
                      style={thumbnailHeight !== null ? { height: thumbnailHeight } : undefined}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={project?.title || "Project cover"}
                          className={
                            thumbnailHeight !== null ? "h-full w-full object-cover" : "w-full"
                          }
                        />
                      ) : isEditable ? (
                        <div
                          className="flex w-full flex-col items-center justify-center gap-3 bg-[#F0EDE7] text-[#7A736C] dark:bg-[#2A2520] dark:text-[#9E9893]"
                          style={{ height: thumbnailHeight ?? 400 }}
                        >
                          <Upload size={28} className="opacity-50" />
                          <span className="text-[13px] font-medium">Upload cover image</span>
                        </div>
                      ) : (
                        // No thumbnail in public/preview — render nothing (no placeholder)
                        <div
                          className="w-full bg-[#F0EDE7] dark:bg-[#2A2520]"
                          style={{ height: 400 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Upload hover overlay (editor only) */}
                  {hoverOverlay}
                  {fileInput}
                </div>
              </motion.div>

              {/* Height resize handle — shared ResizeHandle component */}
              {isEditable && (
                <ResizeHandle
                  axis="height"
                  show={showHeightHandle}
                  getSize={() => ({
                    width: thumbnailImgRef.current?.offsetWidth ?? 0,
                    height: thumbnailImgRef.current?.offsetHeight ?? thumbnailHeight ?? 400,
                  })}
                  min={120}
                  max={() => Math.round(window.innerHeight * 0.95)}
                  onResizingChange={setIsResizingHeight}
                  onHoverChange={setHeightHandleHovered}
                  onChange={({ height }) => setThumbnailHeight(height)}
                />
              )}
            </div>
          </motion.div>

          {/* Metadata grid below image */}
          {(mode === "editor" || hasProjectMeta(project)) && (
            <div className="mx-auto mt-10 w-full max-w-[880px] px-6 md:px-10">
              <div className="border-b border-black/[0.07] dark:border-white/[0.07]">
                <ProjectMetaGrid project={project} onMetaChange={onMetaChange} mode={mode} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

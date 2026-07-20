import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectMetaGrid, { hasProjectMeta } from "./ProjectMetaGrid";
import ResizeHandle from "@/components/project/ResizeHandle";
import { TextEffect } from "@/components/ui/text-effect";
import EditableField from "./EditableField";
import NavRow from "./NavRow";
import HeroUploadOverlay from "./HeroUploadOverlay";
import ThumbnailWidthToggle from "./ThumbnailWidthToggle";

// Shared title typography — used by both the blur-in animation and the
// editable field so they stay pixel-identical.
const EDITORIAL_TITLE_CLS =
  "mb-5 text-[28px] leading-[1.25] font-semibold tracking-[-0.02em] md:text-[32px]";

export default function EditorialHero({
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
  const thumbnailImgRef = useRef(null);

  // Layout values come from project (persisted), not local state
  const thumbnailWidth = project?.thumbnailWidth ?? "contained";
  const thumbnailHeight = project?.thumbnailHeight ?? null;

  // Transient UI states — no need to persist
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [showHeightHandle, setShowHeightHandle] = useState(false);
  const [heightHandleHovered, setHeightHandleHovered] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      onImageUpload?.(file);
    },
    [onImageUpload]
  );

  const setThumbnailWidth = useCallback((v) => onChange?.({ thumbnailWidth: v }), [onChange]);
  const setThumbnailHeight = useCallback((v) => onChange?.({ thumbnailHeight: v }), [onChange]);

  // Upload interactions — editor only
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

  return (
    <motion.div
      key="editorial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <NavRow dark={false} containerClass="max-w-[880px] px-6 md:px-10" {...navRowProps} />

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
          <ThumbnailWidthToggle
            thumbnailWidth={thumbnailWidth}
            setThumbnailWidth={setThumbnailWidth}
          />
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
                      className={thumbnailHeight !== null ? "h-full w-full object-cover" : "w-full"}
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
              {isEditable && <HeroUploadOverlay inputRef={inputRef} onFile={handleFile} />}
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
      {(isEditable || hasProjectMeta(project)) && (
        <div className="mx-auto mt-10 w-full max-w-[880px] px-6 md:px-10">
          <div className="border-b border-black/[0.07] dark:border-white/[0.07]">
            <ProjectMetaGrid project={project} onMetaChange={onMetaChange} mode={mode} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ChevronLeft, Upload, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { _updateProject } from "@/network/post-request";
import ProjectMetaGrid from "./ProjectMetaGrid";

// ─── Inline-editable field ────────────────────────────────────────────────────
function EditableField({ value, onChange, tag: Tag = "span", placeholder, className, readOnly }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerText = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — user edits are the source of truth thereafter

  if (readOnly) {
    return <Tag className={className}>{value || ""}</Tag>;
  }
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e) => onChange?.(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter" && Tag !== "div" && Tag !== "p") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={[
        "block w-full cursor-text rounded-sm transition-colors outline-none",
        className ?? "",
      ].join(" ")}
    />
  );
}

// ─── View toggle SVGs ─────────────────────────────────────────────────────────
function ViewToggle({ heroView, setHeroView, dark }) {
  const activeClass = dark ? "bg-white/20" : "bg-white dark:bg-[#2A2520] shadow-sm";
  const inactiveClass = dark ? "hover:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg p-1",
        dark ? "bg-white/10 backdrop-blur-sm" : "bg-black/5 dark:bg-white/5"
      )}
    >
      <button
        onClick={() => setHeroView("immersive")}
        title="Immersive view"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-all",
          heroView === "immersive" ? activeClass : inactiveClass
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="1.5"
            fill={dark ? "white" : "currentColor"}
            fillOpacity={heroView === "immersive" ? (dark ? 1 : 0.85) : dark ? 0.5 : 0.4}
          />
        </svg>
      </button>
      <button
        onClick={() => setHeroView("editorial")}
        title="Editorial view"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-all",
          heroView === "editorial" ? activeClass : inactiveClass
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="5"
            rx="1"
            fill={dark ? "white" : "currentColor"}
            fillOpacity={heroView === "editorial" ? (dark ? 1 : 0.85) : dark ? 0.5 : 0.4}
          />
          <rect
            x="1"
            y="8"
            width="7"
            height="1.5"
            rx="0.75"
            fill={dark ? "white" : "currentColor"}
            fillOpacity="0.4"
          />
          <rect
            x="1"
            y="11"
            width="5"
            height="1.5"
            rx="0.75"
            fill={dark ? "white" : "currentColor"}
            fillOpacity="0.4"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Lock popover ─────────────────────────────────────────────────────────────
function LockPopover({ project, dark }) {
  const [enabled, setEnabled] = useState(!!project?.protected);
  const [pwd, setPwd] = useState(project?.password ?? "");
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (newEnabled, newPwd) => {
      if (!project?._id) return;
      setSaving(true);
      try {
        await _updateProject(project._id, {
          protected: newEnabled,
          password: newEnabled ? newPwd : "",
        });
      } finally {
        setSaving(false);
      }
    },
    [project?._id]
  );

  const handleToggle = (val) => {
    setEnabled(val);
    save(val, pwd);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Protect project"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
            dark
              ? "border-white/10 bg-white/10 text-white/80 hover:bg-white/20"
              : "border-black/10 bg-white/50 text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2520]/50 dark:text-[#F0EDE7] dark:hover:bg-white/5"
          )}
        >
          <Lock size={12} strokeWidth={2.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#2A2520]"
        align="end"
        sideOffset={8}
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              Protect Project
            </p>
            <p className="max-w-[160px] text-[11px] leading-snug text-[#7A736C] dark:text-[#9E9893]">
              Require a password to view this project (e.g., for NDAs).
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            className="mt-0.5 data-[state=checked]:bg-[#1A1A1A] dark:data-[state=checked]:bg-[#F0EDE7]"
          />
        </div>
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <input
                type="password"
                placeholder="Enter password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                onBlur={() => save(enabled, pwd)}
                className="h-9 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 text-[13px] text-[#1A1A1A] placeholder-black/30 transition-all outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F0EDE7] dark:placeholder-white/30 dark:focus:ring-white/10"
              />
              {saving && (
                <p className="mt-1.5 text-[11px] text-[#7A736C] dark:text-[#9E9893]">Saving…</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

// ─── Shared nav row ───────────────────────────────────────────────────────────
function NavRow({
  dark,
  mode,
  heroView,
  setHeroView,
  onBack,
  onWorkClick,
  resumeUrl,
  onAnalyze,
  project,
  analyzeStatus,
  analyzeButtonLabel,
  analyzeTooltipMessage,
  isAnalyzeDisabled,
}) {
  const isEditor = mode === "editor";
  const textClass = dark
    ? "text-white/80 hover:text-white"
    : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]";

  return (
    <div className="px-6md:px-12 mx-auto flex w-full max-w-[1100px] items-center justify-between">
      {/* Back */}
      <button
        onClick={onBack}
        className={cn(
          "group flex cursor-pointer items-center gap-1.5 text-[13px] font-medium transition-colors",
          textClass
        )}
      >
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {mode === "editor" ? "Back to Builder" : "Go Back"}
      </button>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Work + Resume links */}
        <div className={cn("flex items-center gap-4 text-[13px] font-medium", textClass)}>
          <button onClick={onWorkClick} className="cursor-pointer transition-colors">
            Work
          </button>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center gap-1 transition-colors"
            >
              <span className="text-[10px]">✦</span> Resume
            </a>
          )}
        </div>

        {/* Editor-only: Lock + Analyze */}
        {isEditor && (
          <div className="flex items-center gap-1.5">
            <LockPopover project={project} dark={dark} />
            {analyzeStatus && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "inline-flex",
                        isAnalyzeDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      )}
                    >
                      <button
                        onClick={onAnalyze}
                        disabled={isAnalyzeDisabled}
                        className={cn(
                          "flex h-7 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-all",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          dark
                            ? "border-white/10 bg-white/10 text-white/80 hover:bg-white/20"
                            : "border-black/10 bg-white/50 text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2520]/50 dark:text-[#F0EDE7] dark:hover:bg-white/5"
                        )}
                      >
                        <Sparkles size={11} strokeWidth={2} />
                        {analyzeButtonLabel}
                      </button>
                    </span>
                  </TooltipTrigger>
                  {analyzeTooltipMessage && (
                    <TooltipContent
                      side="bottom"
                      className="bg-foreground text-background rounded px-2 py-1 text-xs"
                    >
                      {analyzeTooltipMessage}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* View toggle — editor only */}
        {isEditor && setHeroView && (
          <ViewToggle heroView={heroView} setHeroView={setHeroView} dark={dark} />
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProjectHero({
  project,
  onChange,
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

  // Layout values come from project (persisted), not local state
  const heroView = project?.heroView ?? "editorial";
  const thumbnailWidth = project?.thumbnailWidth ?? "full";
  const thumbnailHeight = project?.thumbnailHeight ?? null;

  // These are transient UI states — no need to persist
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [showHeightHandle, setShowHeightHandle] = useState(false);
  const [heightHandleHovered, setHeightHandleHovered] = useState(false);

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
  const immersiveMeta = [
    { label: "Client", key: "client" },
    { label: "Industry", key: "industry" },
    { label: "Role", key: "role" },
    { label: "Platform", key: "platform" },
  ];

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
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
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

            {/* Dark overlays — same as reference */}
            <div className="pointer-events-none absolute inset-0 bg-black/12" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-black/50 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

            {/* Upload overlay (editor only) */}
            {hoverOverlay}
            {fileInput}

            {/* Nav */}
            <div className="pointer-events-none relative z-20 flex justify-center pt-7">
              <div className="pointer-events-auto w-full" onClick={(e) => e.stopPropagation()}>
                <NavRow dark {...navRowProps} />
              </div>
            </div>

            {/* Title + meta at bottom */}
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex justify-center pb-10">
              <div
                className="pointer-events-auto w-full max-w-[1100px] px-6 md:px-12"
                onClick={(e) => e.stopPropagation()}
              >
                {isEditable ? (
                  <EditableField
                    value={project?.title ?? ""}
                    onChange={(v) => onChange?.({ title: v })}
                    tag="h1"
                    placeholder="Project title…"
                    className="mb-8 text-[36px] leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-[52px] [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
                  />
                ) : (
                  <h1 className="mb-8 text-[36px] leading-[1.05] font-bold tracking-[-0.02em] text-white md:text-[52px]">
                    {project?.title || "Untitled Project"}
                  </h1>
                )}

                <div className="grid grid-cols-2 gap-y-5 md:grid-cols-4">
                  {immersiveMeta.map(({ label, key }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium tracking-widest text-white/50 uppercase">
                        {label}
                      </span>
                      {isEditable ? (
                        <EditableField
                          value={project?.[key] ?? ""}
                          onChange={(v) => onChange?.({ [key]: v })}
                          tag="span"
                          placeholder={`Add ${label.toLowerCase()}…`}
                          className="text-[15px] leading-snug font-semibold text-white [&:focus]:bg-white/10 [&:focus]:ring-1 [&:focus]:ring-white/20"
                        />
                      ) : (
                        <span className="text-[15px] leading-snug font-semibold text-white">
                          {project?.[key] || "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
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
              <NavRow dark={false} {...navRowProps} />
            </div>
          </div>

          {/* Title + description */}
          <div className="mx-auto w-full max-w-[880px] px-6 md:px-10">
            <div className="pt-14 pb-10">
              {isEditable ? (
                <>
                  <EditableField
                    value={project?.title ?? ""}
                    onChange={(v) => onChange?.({ title: v })}
                    tag="h1"
                    placeholder="Project title…"
                    className="mb-5 text-[38px] leading-[1.05] font-bold tracking-[-0.02em] text-[#1A1A1A] focus:bg-black/[0.04] focus:ring-1 focus:ring-black/10 md:text-[52px] dark:text-[#F0EDE7] dark:focus:bg-white/[0.06] dark:focus:ring-white/10"
                  />
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
                  <h1 className="mb-5 text-[38px] leading-[1.05] font-bold tracking-[-0.02em] text-[#1A1A1A] md:text-[52px] dark:text-[#F0EDE7]">
                    {project?.title || "Untitled Project"}
                  </h1>
                  {project?.description && (
                    <p className="max-w-2xl text-[18px] leading-relaxed font-[450] text-[#7A736C] dark:text-[#B5AFA5]">
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
                if (!isResizingHeight) {
                  setShowHeightHandle(false);
                  setHeightHandleHovered(false);
                }
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

              {/* Height resize handle — editor only, 3-dot reference style */}
              <AnimatePresence>
                {isEditable && (showHeightHandle || isResizingHeight) && (
                  <motion.div
                    key="height-handle"
                    initial={{ opacity: 0, y: -8, scale: 0.82, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, y: -6, scale: 0.88, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className="group/hh pointer-events-auto absolute flex cursor-ns-resize items-center justify-center select-none"
                    style={{ bottom: -22, left: "50%", width: 160, height: 44 }}
                    onMouseEnter={() => setHeightHandleHovered(true)}
                    onMouseLeave={() => setHeightHandleHovered(false)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const startY = e.clientY;
                      const startH =
                        thumbnailImgRef.current?.offsetHeight ?? thumbnailHeight ?? 400;
                      setIsResizingHeight(true);
                      const onMove = (ev) => {
                        ev.preventDefault();
                        setThumbnailHeight(
                          Math.max(
                            120,
                            Math.min(window.innerHeight * 0.95, startH + (ev.clientY - startY))
                          )
                        );
                      };
                      const onUp = () => {
                        setIsResizingHeight(false);
                        window.removeEventListener("mousemove", onMove);
                        window.removeEventListener("mouseup", onUp);
                      };
                      window.addEventListener("mousemove", onMove);
                      window.addEventListener("mouseup", onUp);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={cn(
                        "flex w-full flex-row items-center justify-center gap-[6px] rounded-full border border-white/[0.15] transition-all duration-200",
                        isResizingHeight
                          ? "scale-105 bg-[#0D0D0D]/60 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_24px_rgba(255,255,255,0.22)]"
                          : "bg-[#0D0D0D]/50 backdrop-blur-sm group-hover/hh:scale-105 group-hover/hh:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.18)]"
                      )}
                      style={{ height: 12 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-full transition-colors duration-200",
                            isResizingHeight
                              ? "bg-white/90"
                              : "bg-white/50 group-hover/hh:bg-white/75"
                          )}
                          style={{ width: 4, height: 4 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Metadata grid below image */}
          <div className="mx-auto mt-10 w-full max-w-[880px] px-6 md:px-10">
            <div className="border-t border-black/[0.07] dark:border-white/[0.07]">
              <ProjectMetaGrid
                project={project}
                onChange={(patch) => onChange?.(patch)}
                mode={mode}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

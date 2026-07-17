import AnalyzeCaseStudy from "@/components/analyzeCaseStudy";
import Modal from "@/components/modal";
import TiptapRenderer from "@/components/tiptapRenderer";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { DEFAULT_META_FIELDS, resolveMetaFields, sidebars } from "@/lib/constant";
import { _analyzeCaseStudy, _analyzeCaseStudyStatus, _updateProject } from "@/network/post-request";
import { AtSignIcon } from "lucide-animated";
import { AlertCircle, AtSign, CheckCircle2, Pencil, Phone, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLazyMigration } from "./hooks/useLazyMigration";
import { useProjectAutosave } from "./hooks/useProjectAutosave";
import ProjectHero from "./ProjectHero";
import SectionManager from "./SectionManager";
import { uploadSectionImage } from "./uploadSectionImage";

// BlockRenderer imports editorjs-blocks-react-renderer which uses browser APIs — load client-only
const BlockRenderer = dynamic(() => import("@/components/blockRenderer"), { ssr: false });

// ─── Contact button with animated icon ───────────────────────────────────────
function ContactButton({ label, icon: Icon, iconRotate = 0, onClick }) {
  return (
    <motion.div whileHover="hover" initial="rest" className="shrink-0 basis-[calc(50%-6px)]">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="group bg-muted hover:bg-accent flex h-auto w-full items-center justify-between rounded-xl px-4 py-3 hover:cursor-pointer"
      >
        <span className="text-foreground text-sm font-medium">{label}</span>
        <motion.div
          className="shrink-0"
          variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.3, rotate: iconRotate } }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon size={14} className="text-muted-foreground group-hover:text-foreground" />
        </motion.div>
      </Button>
    </motion.div>
  );
}

// ─── Contact CTA + footer ─────────────────────────────────────────────────────
function ProjectFooter({ owner, mode }) {
  const { openSidebar } = useGlobalContext();
  const isEditor = mode === "editor";
  const fullName = [owner?.firstName, owner?.lastName].filter(Boolean).join(" ");
  const contactEmail = owner?.contact_email || owner?.contact?.email;
  const phone = owner?.phone;
  const hasContact = !!(contactEmail || phone);
  const [copiedField, setCopiedField] = useState(null);

  const copy = useCallback((value, field) => {
    if (!value || typeof navigator === "undefined") return;
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  return (
    <>
      {/* Divider */}
      <div className="mx-auto w-full max-w-[880px] px-6 md:px-10">
        <div className="border-t border-black/[0.07] dark:border-white/[0.07]" />
      </div>

      {/* Contact CTA */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center px-6 py-8 text-center md:px-10"
      >
        {fullName && (
          <h1 className="mb-2 font-['Cedarville_Cursive'] text-[23px] text-[#1A1A1A] dark:text-[#F0EDE7]">
            {fullName}
          </h1>
        )}
        <p className="mb-4 max-w-sm text-[28px] leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Got a project in mind or just curious? Let&apos;s talk.
        </p>

        {hasContact ? (
          <div className="mb-4 flex w-full max-w-sm flex-wrap justify-center gap-3">
            {contactEmail && (
              <ContactButton
                label={copiedField === "email" ? "Copied!" : "Copy mail"}
                icon={AtSignIcon}
                iconRotate={15}
                onClick={() => copy(contactEmail, "email")}
              />
            )}
            {phone && (
              <ContactButton
                label={copiedField === "phone" ? "Copied!" : "Copy phone"}
                icon={Phone}
                iconRotate={-15}
                onClick={() => copy(phone, "phone")}
              />
            )}
          </div>
        ) : isEditor ? (
          <button
            onClick={() => openSidebar(sidebars.footer)}
            className="mb-4 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-black/20 px-5 py-3 text-[13px] font-medium text-[#7A736C] transition-colors hover:border-black/30 hover:bg-black/[0.03] hover:text-[#1A1A1A] dark:border-white/20 dark:text-[#9E9893] dark:hover:border-white/30 dark:hover:bg-white/[0.03] dark:hover:text-[#F0EDE7]"
          >
            <AtSign size={14} />
            Add contact info
          </button>
        ) : null}

        {isEditor && hasContact && (
          <button
            onClick={() => openSidebar(sidebars.footer)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white/50 px-3 py-1.5 text-[12px] font-medium text-[#7A736C] transition-colors hover:bg-black/5 hover:text-[#1A1A1A] dark:border-white/10 dark:bg-white/5 dark:text-[#9E9893] dark:hover:bg-white/10 dark:hover:text-[#F0EDE7]"
          >
            <Pencil size={12} />
            Edit contact
          </button>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants} className="px-6 py-5 text-center md:px-10">
        <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893]" style={{ fontWeight: 450 }}>
          © ALL RIGHTS RESERVED.
        </p>
      </motion.div>
    </>
  );
}

// ─── Save status pill ────────────────────────────────────────────────────────

function SaveStatusPill({ saveStatus, onRetry }) {
  // "Synced" fades out after 2 s
  const [showSynced, setShowSynced] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (saveStatus === "saved") {
      timerRef.current = setTimeout(() => setShowSynced(true), 0);
      const hideTimer = setTimeout(() => setShowSynced(false), 2000);
      return () => {
        clearTimeout(timerRef.current);
        clearTimeout(hideTimer);
      };
    }
    clearTimeout(timerRef.current);
    const t = setTimeout(() => setShowSynced(false), 0);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(t);
    };
  }, [saveStatus]);

  if (saveStatus === "saving") {
    return (
      <div className="pointer-events-none fixed top-3 right-4 z-50 flex items-center gap-1.5 text-[12px] font-medium text-[#7A736C] select-none dark:text-[#9E9893]">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        Syncing…
      </div>
    );
  }

  if (saveStatus === "error") {
    return (
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 text-[12px] font-medium select-none">
        <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
          <AlertCircle size={12} />
          Couldn&apos;t save
        </span>
        <button
          onClick={onRetry}
          className="pointer-events-auto flex cursor-pointer items-center gap-1 text-[#7A736C] underline underline-offset-2 transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
        >
          <RotateCcw size={11} />
          Retry
        </button>
      </div>
    );
  }

  if (showSynced) {
    return (
      <div className="pointer-events-none fixed top-3 right-4 z-50 flex items-center gap-1.5 text-[12px] font-medium text-green-500 select-none dark:text-green-400">
        <CheckCircle2 size={12} />
        Synced
      </div>
    );
  }

  return null;
}

export default function ProjectDetail({ project, mode, onBack, onWorkClick, resumeUrl, owner }) {
  const {
    wordCount,
    setShowUpgradeModal,
    setUpgradeModalSource,
    analysisCreditsRemaining,
    setAnalysisCreditsRemaining,
    setUserDetails,
  } = useGlobalContext();

  const [projectState, setProjectState] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    thumbnail: project?.thumbnail ?? null,
    metaFields: project?.metaFields?.length
      ? project.metaFields
      : DEFAULT_META_FIELDS.map(({ defaultLabel }) => ({ label: defaultLabel, value: "" })),
    heroView: project?.heroView ?? "editorial",
    thumbnailWidth: project?.thumbnailWidth ?? "contained",
    thumbnailHeight: project?.thumbnailHeight ?? null,
  });

  const projectId = project?._id;

  // ─── Analyze state ────────────────────────────────────────────────────────
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(false);
  const [analyzeSuggestions, setAnalyzeSuggestions] = useState([]);
  const [analyzeRating, setAnalyzeRating] = useState("");

  const fetchAnalyzeStatus = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await _analyzeCaseStudyStatus(projectId);
      if (res.data.status) {
        setAnalyzeSuggestions(res.data.data.data.response);
        setAnalyzeRating(res.data.data.data.rating);
      }
      setAnalyzeStatus(true);
    } catch {}
  }, [projectId]);

  useEffect(() => {
    if (mode === "editor") startTransition(() => void fetchAnalyzeStatus());
  }, [fetchAnalyzeStatus, mode]);

  const needsMoreWords = analyzeSuggestions.length === 0 && wordCount !== null && wordCount < 400;
  const outOfCredits = analysisCreditsRemaining !== null && analysisCreditsRemaining <= 0;
  const isAnalyzeDisabled = isAnalyzing || needsMoreWords;
  const analyzeButtonLabel = isAnalyzing
    ? "Analyzing..."
    : analyzeSuggestions.length > 0
      ? "Show Score Card"
      : "Analyze with AI";
  const analyzeTooltipMessage = outOfCredits
    ? "Upgrade to Pro to analyze Case Study"
    : needsMoreWords
      ? "400 words required to analyze"
      : wordCount != null
        ? `${wordCount} words`
        : null;

  const mergedProject = useMemo(() => ({ ...project, ...projectState }), [project, projectState]);

  const handleAnalyzeClick = useCallback(async () => {
    if (analyzeSuggestions.length > 0) {
      setShowAnalyzeModal(true);
      return;
    }
    if (analysisCreditsRemaining !== null && analysisCreditsRemaining <= 0) {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
      return;
    }
    setIsAnalyzing(true);
    try {
      const aiProject = {
        ...mergedProject,
        metaFields: mergedProject.metaFields?.map(({ value }) => ({ value })),
      };
      const res = await _analyzeCaseStudy({ userId: projectId, caseStudy: aiProject, projectId });
      setShowAnalyzeModal(true);
      setAnalyzeSuggestions(res.data.response);
      setAnalyzeRating(res.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    analyzeSuggestions,
    analysisCreditsRemaining,
    mergedProject,
    projectId,
    setUpgradeModalSource,
    setShowUpgradeModal,
    setAnalysisCreditsRemaining,
  ]);

  const handleReAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const aiProject = {
        ...mergedProject,
        metaFields: mergedProject.metaFields?.map(({ value }) => ({ value })),
      };
      const res = await _analyzeCaseStudy({ userId: projectId, caseStudy: aiProject, projectId });
      setAnalyzeSuggestions(res.data.response);
      setAnalyzeRating(res.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    mergedProject,
    projectId,
    setUpgradeModalSource,
    setShowUpgradeModal,
    setAnalysisCreditsRemaining,
  ]);

  const handleMigrated = useCallback(
    (migratedSections) => {
      if (projectId) {
        _updateProject(projectId, {
          sections: migratedSections,
          tiptapContent: null,
          content: null,
          contentVersion: 3,
        });
      }
    },
    [projectId]
  );

  const { sections, setSections } = useLazyMigration({
    project,
    mode,
    onMigrated: handleMigrated,
  });

  const savePayload = useMemo(
    () => ({ ...projectState, sections }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      projectState.title,
      projectState.description,
      projectState.thumbnail,
      projectState.metaFields,
      projectState.heroView,
      projectState.thumbnailWidth,
      projectState.thumbnailHeight,
      sections,
    ]
  );

  const handleSaveSuccess = useCallback(
    (savedState) => {
      if (!projectId) return;
      const { sections: _sections, ...heroFields } = savedState;
      setUserDetails((prev) => {
        if (!prev) return prev;
        const updatedProjects = (prev.projects || []).map((p) =>
          p._id === projectId ? { ...p, ...heroFields } : p
        );
        return { ...prev, projects: updatedProjects };
      });
    },
    [projectId, setUserDetails]
  );

  const { saveStatus, retry } = useProjectAutosave({
    projectId: project?._id,
    projectState: savePayload,
    mode,
    onSaveSuccess: handleSaveSuccess,
  });

  const handleProjectChange = useCallback(
    (patch) => {
      setProjectState((prev) => ({ ...prev, ...patch }));
      // Optimistically sync into the userDetails.projects cache so the portfolio
      // builder reflects changes immediately on navigation (before autosave fires).
      setUserDetails((prev) => {
        if (!prev || !projectId) return prev;
        const updatedProjects = (prev.projects || []).map((p) =>
          p._id === projectId ? { ...p, ...patch } : p
        );
        return { ...prev, projects: updatedProjects };
      });
    },
    [projectId, setUserDetails]
  );

  const handleMetaChange = useCallback(
    (index, patch) => {
      setProjectState((prev) => {
        const base = prev.metaFields?.length ? prev.metaFields : resolveMetaFields(project);
        const newMetaFields = base.map((f, i) => (i === index ? { ...f, ...patch } : f));
        return { ...prev, metaFields: newMetaFields };
      });
    },
    [project]
  );

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;
      try {
        const { key, url } = await uploadSectionImage(file);
        handleProjectChange({
          thumbnail: { key, url, originalName: file.name, extension: file.type },
        });
      } catch {
        /* upload failed — keep the existing thumbnail */
      }
    },
    [handleProjectChange]
  );

  // Legacy content fallback — only relevant in public/preview mode where useLazyMigration
  // doesn't run. If the user's live snapshot was never re-published after the v1→v2 or
  // v2→v3 migration, sections will be empty and we fall back to the old renderer.
  const hasNewContent = sections.length > 0;
  const showLegacyTiptap =
    mode !== "editor" &&
    !hasNewContent &&
    mergedProject?.tiptapContent &&
    Object.keys(mergedProject.tiptapContent || {}).length > 0;
  const showLegacyEditorJS =
    mode !== "editor" &&
    !hasNewContent &&
    !showLegacyTiptap &&
    Array.isArray(mergedProject?.content?.blocks) &&
    mergedProject.content.blocks.length > 0;

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] dark:bg-[#1A1A1A] dark:text-[#F0EDE7]">
      {/* Save status pill — top-right, only in editor mode */}
      {/* Temporarily hidden — collides with the full-width editor nav controls */}
      {/* {mode === "editor" && <SaveStatusPill saveStatus={saveStatus} onRetry={retry} />} */}

      <ProjectHero
        project={mergedProject}
        onChange={handleProjectChange}
        onMetaChange={handleMetaChange}
        mode={mode}
        onImageUpload={handleImageUpload}
        onBack={onBack}
        onWorkClick={onWorkClick}
        resumeUrl={resumeUrl}
        analyzeStatus={analyzeStatus}
        analyzeButtonLabel={analyzeButtonLabel}
        analyzeTooltipMessage={analyzeTooltipMessage}
        isAnalyzeDisabled={isAnalyzeDisabled}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyzeClick}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* New sections content (v3) — always render in editor so EmptyState shows */}
        {(mode === "editor" || hasNewContent) && (
          <SectionManager sections={sections} onChange={setSections} mode={mode} />
        )}

        {/* Legacy Tiptap content (v2) — read-only, never editable */}
        {showLegacyTiptap && (
          <div className="mx-auto max-w-[880px] px-6 py-10 md:px-10">
            <TiptapRenderer content={mergedProject.tiptapContent} />
          </div>
        )}

        {/* Legacy EditorJS content (v1) — read-only, never editable */}
        {showLegacyEditorJS && (
          <div className="mx-auto max-w-[880px] px-6 py-10 md:px-10">
            <BlockRenderer editorJsData={mergedProject.content} />
          </div>
        )}

        <ProjectFooter owner={owner} mode={mode} />
      </motion.div>

      <Modal show={showAnalyzeModal} className="md:block">
        <AnalyzeCaseStudy
          wordCount={wordCount}
          setShowModal={() => setShowAnalyzeModal(false)}
          suggestions={analyzeSuggestions}
          rating={analyzeRating}
          projectId={projectId}
          analyzeCallback={handleReAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </Modal>
    </div>
  );
}

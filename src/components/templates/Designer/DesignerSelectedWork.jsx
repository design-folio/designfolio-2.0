import React, { useCallback, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRouter } from "next/router";
import { Pencil, Trash2, Plus, Sparkles, ArrowUpRight, ChevronsUpDown } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { useCursorTooltip } from "@/context/cursorTooltipContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { modals, sidebars } from "@/lib/constant";
import { _updateProject } from "@/network/post-request";
import { ProjectVisibilityButton } from "@/components/section";

// Subtle zigzag (sawtooth) — 12 small teeth across top and bottom
const CARD_CLIP =
  "polygon(" +
  "0% 3%, 4.17% 0%, 8.33% 3%, 12.5% 0%, 16.67% 3%, 20.83% 0%, 25% 3%, 29.17% 0%, 33.33% 3%, 37.5% 0%, 41.67% 3%, 45.83% 0%, 50% 3%, 54.17% 0%, 58.33% 3%, 62.5% 0%, 66.67% 3%, 70.83% 0%, 75% 3%, 79.17% 0%, 83.33% 3%, 87.5% 0%, 91.67% 3%, 95.83% 0%, 100% 3%," +
  "100% 97%, 95.83% 100%, 91.67% 97%, 87.5% 100%, 83.33% 97%, 79.17% 100%, 75% 97%, 70.83% 100%, 66.67% 97%, 62.5% 100%, 58.33% 97%, 54.17% 100%, 50% 97%, 45.83% 100%, 41.67% 97%, 37.5% 100%, 33.33% 97%, 29.17% 100%, 25% 97%, 20.83% 100%, 16.67% 97%, 12.5% 100%, 8.33% 97%, 4.17% 100%, 0% 97%" +
  ")";

function getHref(id, isEditing, isPreview, publicView) {
  if (isEditing) return `/project/${id}/editor`;
  if (isPreview && !publicView) return `/project/${id}/preview`;
  return `/project/${id}`;
}

function playCoinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    [
      { f: 988.0, t: 0.0 },
      { f: 1318.5, t: 0.09 },
    ].forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.connect(gain);
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.12);
    });
  } catch {
    /* AudioContext blocked */
  }
}

function DesignerWorkCard({
  project,
  index,
  total,
  scrollYProgress,
  isEditing,
  isMobile,
  onNavigate,
  onEdit,
  onDelete,
  onToggleVisibility,
}) {
  const isLast = index === total - 1;
  const segStart = total > 1 ? index / (total - 1) : 0;
  const segEnd = total > 1 ? (index + 1) / (total - 1) : 1;
  const targetScale = 1 - (total - index) * 0.05;
  const scale = useTransform(
    scrollYProgress,
    isLast ? [0, 1] : [segStart, segEnd],
    isLast ? [1, 1] : [1, targetScale]
  );

  const rotStart = Math.min(0.82, (index / Math.max(total, 1)) * 0.7);
  const rotFrom = index % 2 === 0 ? -2.5 : 3;
  const rotate = useTransform(
    scrollYProgress,
    [rotStart, Math.min(1, rotStart + 0.18)],
    [rotFrom, 0]
  );

  const { setCursorPill } = useCursorTooltip();

  return (
    // alignItems (the cross-axis, i.e. vertical for a row-direction flex box) was
    // "center", vertically centering each card inside its own 100vh sticky slot — for
    // card 0 that reads as a huge empty gap above it before any scrolling has happened.
    // flex-start + a fixed paddingTop keeps a consistent, modest offset instead.
    <div
      style={{
        position: "sticky",
        top: 72,
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 96,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{
          scale,
          rotate: isMobile ? 0 : rotate,
          transformOrigin: "center center",
          position: "relative",
          width: "100%",
        }}
      >
        {isEditing && (
          <div className="absolute top-4 right-5 z-20 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-gray-50"
              aria-label="Edit project"
            >
              <Pencil className="h-3.5 w-3.5 text-[#1A1A1A]" />
            </button>
            <ProjectVisibilityButton
              isHidden={!!project.hidden}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(project._id);
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete project"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A]" />
            </button>
          </div>
        )}

        <div
          className="relative flex flex-col items-center gap-8 overflow-hidden px-7 py-8 md:gap-12 md:px-10 md:py-10"
          style={{
            clipPath: CARD_CLIP,
            backgroundColor: index % 2 === 0 ? "#FBEFDD" : "rgb(255, 249, 162)",
            backgroundImage: "url('/assets/backgrounds/bgcard.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 4px 16px rgba(15,23,42,0.14), 0 16px 48px rgba(15,23,42,0.18)",
          }}
        >
          <div
            className={`flex w-full flex-col items-center gap-8 md:gap-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
          >
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <h3
                className="designer-heading mb-4 text-[#0F172A]"
                style={{
                  fontSize: "clamp(18px, 2.4vw, 26px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {project?.title}
              </h3>
              <p className="mb-6 max-w-[360px] text-[14px] leading-[1.7] text-[#475569]">
                {project?.description}
              </p>

              {project?.hidden && (
                <span className="mb-4 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium text-amber-700">
                  Hidden from live site
                </span>
              )}

              <button
                onClick={() => {
                  playCoinSound();
                  setCursorPill(false);
                  onNavigate(project._id);
                }}
                onMouseEnter={() => setCursorPill(true, "Read case study")}
                onMouseLeave={() => setCursorPill(false)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-[3px] border-[#5A2D00] px-5 py-[9px] text-[13px] font-bold tracking-[0.02em] text-[#3D1A00] select-none"
                style={{
                  background: "linear-gradient(to bottom, #FFE045 0%, #F5A800 60%, #D48000 100%)",
                  boxShadow:
                    "inset 0 3px 0 rgba(255,255,200,0.55), 0 4px 0 #5A2D00, 0 5px 8px rgba(0,0,0,0.22)",
                }}
              >
                Read case study
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="w-full flex-shrink-0 md:w-[56%]">
              <div className="relative overflow-hidden rounded-[16px] border border-black/[0.08] bg-[#E2E8F0]">
                <img
                  src={project?.thumbnail?.url}
                  alt={project?.title}
                  className="block aspect-[4/3] h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DesignerSelectedWork({ isEditing, preview = false, publicView = false }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { userDetails, setUserDetails, setSelectedProject, openModal, openSidebar, updateCache } =
    useGlobalContext();
  const { projects = [] } = userDetails || {};
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const visibleProjects = useMemo(
    () => (isEditing ? projects : (projects || []).filter((p) => !p.hidden)),
    [projects, isEditing]
  );

  const handleNavigate = useCallback(
    (id) => router.push(getHref(id, isEditing, preview, publicView)),
    [router, isEditing, preview, publicView]
  );

  const handleEdit = useCallback(
    (project) => router.push(`/project/${project._id}/editor`),
    [router]
  );

  const handleDelete = useCallback(
    (project) => {
      openModal(modals.deleteProject);
      setSelectedProject(project);
    },
    [openModal, setSelectedProject]
  );

  const handleToggleVisibility = useCallback(
    (projectId) => {
      const project = (projects || []).find((p) => p._id === projectId);
      if (!project) return;
      const updated = (projects || []).map((p) =>
        p._id === projectId ? { ...p, hidden: !p.hidden } : p
      );
      _updateProject(projectId, { hidden: !project.hidden });
      setUserDetails((prev) => ({ ...prev, projects: updated }));
      updateCache("userDetails", (prev) => ({ ...prev, projects: updated }));
    },
    [projects, setUserDetails, updateCache]
  );

  const n = visibleProjects.length;

  if (!isEditing && n === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ height: n > 0 ? `${n * 100}vh` : undefined, position: "relative" }}
      className="pt-16"
    >
      <div className="mb-1 px-6 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="#3B82F6" />
          </svg>
          <span className="designer-script text-[22px] font-bold tracking-[0.04em] text-[#439BEA]">
            Selected work
          </span>
          <div className="h-px flex-1 bg-[#E2E8F0]" />
          {isEditing && n > 0 && (
            <div className="flex flex-shrink-0 gap-2">
              {n >= 2 && (
                <button
                  onClick={() => openSidebar(sidebars.sortProjects)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-sm hover:bg-gray-50"
                  aria-label="Rearrange projects"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => openSidebar(sidebars.project)}
                className="flex h-8 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium shadow-sm hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          )}
        </div>
        <h2
          className="designer-heading text-[#0F172A]"
          style={{
            fontSize: "clamp(22px, 3.2vw, 38px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          check out some of my work
        </h2>
      </div>

      {n === 0 ? (
        <div className="mx-6 mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-16 text-center md:mx-0">
          <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A]">No projects yet</h3>
          <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C]">
            Add some projects to showcase your work.
          </p>
          {isEditing && (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <button
                onClick={() => openSidebar(sidebars.project)}
                className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm hover:bg-black/80"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Project
              </button>
              <button
                onClick={() => openModal(modals.aiProject)}
                className="flex h-9 items-center gap-2 rounded-full border border-black/10 px-5 text-[13px] font-medium hover:bg-black/5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Write with AI
              </button>
            </div>
          )}
        </div>
      ) : (
        visibleProjects.map((project, i) => (
          <DesignerWorkCard
            key={project._id}
            project={project}
            index={i}
            total={n}
            scrollYProgress={scrollYProgress}
            isEditing={isEditing}
            isMobile={isMobile}
            onNavigate={handleNavigate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
          />
        ))
      )}
    </div>
  );
}

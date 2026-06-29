import React, { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronsUpDown,
  WandSparklesIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobalContext } from "@/context/globalContext";
import { modals, sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton, ProjectVisibilityButton } from "@/components/section";
import { _updateProject } from "@/network/post-request";
import { useRouter } from "next/router";

const getHref = (id, isEditing, isPreview) => {
  if (isEditing) return `/project/${id}/editor`;
  if (isPreview) return `/project/${id}/preview`;
  return `/project/${id}`;
};

function ProjectCard({
  project,
  isEditing,
  isPreview,
  onNavigate,
  onPrefetch,
  onDelete,
  onToggleVisibility,
}) {
  return (
    <div
      className="group/card relative flex cursor-pointer flex-col gap-4"
      onClick={() => onNavigate(getHref(project._id, isEditing, isPreview))}
      onMouseEnter={() => onPrefetch(getHref(project._id, isEditing, isPreview))}
    >
      {isEditing && (
        <div
          className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity ${project.hidden ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover/card:opacity-100"}`}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 cursor-pointer rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(getHref(project._id, isEditing, isPreview));
            }}
          >
            <Pencil className="pointer-events-none h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <ProjectVisibilityButton
            isHidden={!!project.hidden}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(project._id);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 cursor-pointer rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
          >
            <Trash2 className="pointer-events-none h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <div className="pointer-events-none relative aspect-[3/2] overflow-hidden rounded-2xl border border-black/5 bg-[#F5F5F5] dark:border-white/10 dark:bg-[#1A1A1A]">
        <img
          src={project?.thumbnail?.url}
          alt={project?.title || "project image"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
        />
        {project?.hidden && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <EyeOff className="h-3 w-3" />
            Hidden from live site
          </div>
        )}
      </div>
      <div className="pointer-events-none">
        <h3 className="mb-2 line-clamp-2 text-base leading-snug font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
          {project?.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
          {project?.description}
        </p>
      </div>
    </div>
  );
}

const MemoizedProjectCard = React.memo(ProjectCard);

function ProjectsEmptyState({ isEditing, openModal, openSidebar }) {
  return (
    <div className="bg-background flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center md:col-span-2 dark:border-white/10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.03]">
        <svg
          className="h-6 w-6 text-[#7A736C] dark:text-[#9E9893]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
        No projects yet
      </h3>
      <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C] dark:text-[#9E9893]">
        Add some projects to showcase your work and experience.
      </p>
      {isEditing && (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={() => openSidebar(sidebars.project)}
            className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Pencil className="h-3.5 w-3.5" />
            Write from Scratch
          </Button>
          <Button
            variant="secondary"
            onClick={() => openModal(modals.aiProject)}
            className="h-9 rounded-full px-5 text-[13px] font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Write using AI
          </Button>
        </div>
      )}
    </div>
  );
}

// publicView = public portfolio page (preview/[id]) — navigate to /project/id (no suffix)
// preview    = portfolio-preview page — navigate to /project/id/preview
function CanvasProjectsSection({ isEditing, preview, publicView = false }) {
  const {
    userDetails,
    setUserDetails,
    setSelectedProject,
    openModal,
    openSidebar,
    updateCache,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
  } = useGlobalContext();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { projects } = userDetails || {};

  const visibleProjects = useMemo(() => {
    if (!isEditing && projects) {
      return projects.filter((project) => !project.hidden);
    }
    return projects || [];
  }, [projects, isEditing]);

  const handleNavigation = useCallback((route) => router.push(route), [router]);
  const handlePrefetch = useCallback((route) => router.prefetch(route), [router]);

  const onDeleteProject = useCallback(
    (project) => {
      openModal(modals.deleteProject);
      setSelectedProject(project);
    },
    [openModal, setSelectedProject]
  );

  const handleToggleProjectVisibility = useCallback(
    (projectId) => {
      const project = (projects || []).find((p) => p._id === projectId);
      const visibleCount = (projects || []).filter((p) => !p.hidden).length;
      const isUnhiding = project?.hidden === true;

      if (!userDetails?.pro && isUnhiding && visibleCount >= 2) {
        setUpgradeModalUnhideProject({ projectId, title: project?.title || "Project" });
        setShowUpgradeModal(true);
        return;
      }

      const updatedProjects = (projects || []).map((p) =>
        p._id === projectId ? { ...p, hidden: !p.hidden } : p
      );
      _updateProject(projectId, { hidden: !project.hidden });
      setUserDetails((prev) => ({ ...prev, projects: updatedProjects }));
      updateCache("userDetails", (prev) => ({ ...prev, projects: updatedProjects }));
    },
    [
      projects,
      userDetails,
      setUserDetails,
      updateCache,
      setShowUpgradeModal,
      setUpgradeModalUnhideProject,
    ]
  );

  if (preview && !isEditing && visibleProjects.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.45,
      }}
      className="group/section relative w-full rounded-[26px] border border-[#E5D7C4] bg-white p-4 md:p-6 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          {(projects?.length ?? 0) >= 2 && (
            <CanvasSectionButton
              icon={<ChevronsUpDown className="h-3.5 w-3.5" />}
              ariaLabel="Rearrange projects"
              tooltipText="Rearrange"
              onClick={() => openSidebar(sidebars.sortProjects)}
            />
          )}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <CanvasSectionButton
                icon={<Plus className="h-3.5 w-3.5" />}
                ariaLabel="Add project"
                alwaysVisible={isDropdownOpen}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#2A2520]"
            >
              <DropdownMenuItem
                onClick={() => openSidebar(sidebars.project)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] hover:bg-black/5 focus:bg-black/5 dark:text-[#F0EDE7] dark:hover:bg-white/10 dark:focus:bg-white/5"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Write from Scratch</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => openModal(modals.aiProject)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] hover:bg-black/5 focus:bg-black/5 dark:text-[#F0EDE7] dark:hover:bg-white/10 dark:focus:bg-white/5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Write using AI</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SectionVisibilityButton
            sectionId="projects"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border border-[#E5D7C4] bg-white shadow-md hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}

      <h2 className="font-dm-mono mb-3 text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
        PROJECTS
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleProjects?.length === 0 ? (
          <ProjectsEmptyState
            isEditing={isEditing}
            openModal={openModal}
            openSidebar={openSidebar}
          />
        ) : (
          <>
            {visibleProjects?.map((project) => (
              <MemoizedProjectCard
                key={project._id}
                project={project}
                isEditing={isEditing}
                isPreview={preview && !publicView}
                onNavigate={handleNavigation}
                onPrefetch={handlePrefetch}
                onDelete={onDeleteProject}
                onToggleVisibility={handleToggleProjectVisibility}
              />
            ))}
            {isEditing && (
              <div className="flex flex-col gap-4">
                <div className="flex aspect-[3/2] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-black/[0.015] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.015] dark:hover:bg-white/[0.03]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.05]">
                    <Plus className="h-4 w-4 text-[#7A736C] dark:text-[#9E9893]" />
                  </div>
                  <p className="text-[11px] font-medium tracking-widest text-[#A09890] uppercase dark:text-[#7A736C]">
                    New project
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openSidebar(sidebars.project)}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-[#1A1A1A] px-3.5 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <Plus className="h-3 w-3" />
                      Add Project
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => openModal(modals.aiProject)}
                      className="flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium"
                    >
                      <Sparkles className="h-3 w-3" />
                      Write with AI
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasProjectsSection);

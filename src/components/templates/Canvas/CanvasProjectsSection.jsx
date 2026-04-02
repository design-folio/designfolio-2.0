import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2, Eye, EyeOff, ChevronsUpDown, WandSparklesIcon, Sparkles } from "lucide-react";
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
import ProjectLock from "@/components/projectLock";
import { useRouter } from "next/router";

const getHref = (id, isEditing, isPreview) => {
  if (isEditing) return `/project/${id}/editor`;
  if (isPreview) return `/project/${id}/preview`;
  return `/project/${id}`;
};

function ProjectCard({ project, isEditing, isPreview, onNavigate, onDelete, onToggleVisibility }) {
  return (
    <div
      className="flex flex-col gap-4 group/card cursor-pointer relative"
      onClick={() => onNavigate(getHref(project._id, isEditing, isPreview))}
    >
      {isEditing && (
        <div className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity ${project.hidden ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover/card:opacity-100"}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(getHref(project._id, isEditing, isPreview));
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] pointer-events-none" />
          </Button>
          <ProjectVisibilityButton
            isHidden={!!project.hidden}
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(project._id); }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] pointer-events-none" />
          </Button>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-black/5 dark:border-white/10 bg-[#F5F5F5] dark:bg-[#1A1A1A] pointer-events-none relative">
        <img
          src={project?.thumbnail?.url}
          alt={project?.title || "project image"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
        />
        {project?.hidden && (
          <div className="absolute top-3 left-3 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
            <EyeOff className="w-3 h-3" />
            Hidden from live site
          </div>
        )}
      </div>
      <div className="pointer-events-none">
        <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2 leading-snug line-clamp-2">
          {project?.title}
        </h3>
        <p className="text-[#7A736C] dark:text-[#B5AFA5] text-sm leading-relaxed line-clamp-2">
          {project?.description}
        </p>
      </div>
    </div>
  );
}

const MemoizedProjectCard = React.memo(ProjectCard);


function ProjectsEmptyState({ isEditing, openModal, openSidebar }) {
  return (
    <div className="flex flex-col items-center justify-center md:col-span-2 py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-background">
      <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]"
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
      <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
        No projects yet
      </h3>
      <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
        Add some projects to showcase your work and experience.
      </p>
      {isEditing && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={() => openSidebar(sidebars.project)}
            className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Write from Scratch
          </Button>
          <Button
            variant="secondary"
            onClick={() => openModal(modals.aiProject)}
            className="h-9 px-5 rounded-full text-[13px] font-medium"
          >

            <Sparkles className="w-3.5 h-3.5" />
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

  const onDeleteProject = useCallback(
    (project) => {
      openModal(modals.deleteProject);
      setSelectedProject(project);
    },
    [openModal, setSelectedProject],
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
    [projects, userDetails, setUserDetails, updateCache, setShowUpgradeModal, setUpgradeModalUnhideProject],
  );

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
      className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-4 md:p-6 w-full relative group/section"
    >
      {isEditing && (
        <CanvasSectionControls>
          {(projects?.length ?? 0) >= 2 && (
            <CanvasSectionButton
              icon={<ChevronsUpDown className="w-3.5 h-3.5" />}
              ariaLabel="Rearrange projects"
              onClick={() => openSidebar(sidebars.sortProjects)}
            />
          )}
          {(userDetails?.pro || (projects?.length ?? 0) < 2) && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <CanvasSectionButton icon={<Plus className="w-3.5 h-3.5" />} ariaLabel="Add project" alwaysVisible={isDropdownOpen} />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 bg-white dark:bg-[#2A2520] border border-black/10 dark:border-white/10 shadow-lg rounded-xl overflow-hidden p-1"
              >
                <DropdownMenuItem
                  onClick={() => openSidebar(sidebars.project)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Write from Scratch</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => openModal(modals.aiProject)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Write using AI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <SectionVisibilityButton
            sectionId="projects"
            showOnHoverWhenVisible
            className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}

      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-3"
      >
        PROJECTS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleProjects?.length === 0 ? (
          <ProjectsEmptyState isEditing={isEditing} openModal={openModal} openSidebar={openSidebar} />
        ) : (
          <>
            {visibleProjects?.map((project) => (
              <MemoizedProjectCard
                key={project._id}
                project={project}
                isEditing={isEditing}
                isPreview={preview && !publicView}
                onNavigate={handleNavigation}
                onDelete={onDeleteProject}
                onToggleVisibility={handleToggleProjectVisibility}
              />
            ))}
            {isEditing && !(userDetails?.pro || visibleProjects.length < 2) && (
              <div className="md:col-span-2">
                <ProjectLock />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasProjectsSection);

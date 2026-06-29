import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { screwClass, frameBorderClass } from "./professional-utils";
import { SectionVisibilityButton, ProjectVisibilityButton } from "@/components/section";
import { modals, sidebars } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import { ProfessionalRearrangeButton } from "./ProfessionalRearrangeButton";

const ScrewDot = ({ className }) => <div className={`absolute ${className} ${screwClass}`} />;

const FrameScrews = () => (
  <>
    <ScrewDot className="top-3 left-3 md:top-3.5 md:left-3.5" />
    <ScrewDot className="top-3 right-3 md:top-3.5 md:right-3.5" />
    <ScrewDot className="bottom-3 left-3 md:bottom-3.5 md:left-3.5" />
    <ScrewDot className="right-3 bottom-3 md:right-3.5 md:bottom-3.5" />
  </>
);

const FrameBorders = () => (
  <>
    <div className="pointer-events-none absolute inset-[-16px] border border-[#D5D0C6] md:inset-[-20px] dark:border-[#3A352E]" />
    <div className="pointer-events-none absolute inset-0 z-30 border border-[#D5D0C6] dark:border-[#3A352E]" />
  </>
);

function ProfessionalProjectsTab({
  isEditing,
  visibleProjects,
  onAddProject,
  onProjectClick,
  onProjectPrefetch,
  onEditProject,
  onDeleteProject,
  onToggleVisibility,
  openSidebar,
}) {
  const { openModal } = useGlobalContext();

  return (
    <div className="group/section grid grid-cols-1 gap-0">
      {/* Sort + Section visibility controls */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2 border-b border-[#D5D0C6] px-1 py-2 dark:border-[#3A352E]">
          {visibleProjects.length >= 2 && (
            <ProfessionalRearrangeButton
              onClick={() => openSidebar?.(sidebars.sortProjects)}
              title="Rearrange projects"
              tooltipText="Rearrange"
            />
          )}
          <SectionVisibilityButton
            sectionId="projects"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-[#D5D0C6] bg-[#EFECE6] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:hover:bg-[#2A2520]"
          />
        </div>
      )}

      {visibleProjects.map((project) => (
        <div
          key={project._id}
          onClick={() => onProjectClick(project)}
          onMouseEnter={() => onProjectPrefetch?.(project)}
          className={`group relative flex cursor-pointer flex-col ${frameBorderClass}`}
        >
          {isEditing && (
            <div
              className={`absolute top-4 right-4 z-40 flex gap-2 transition-opacity ${project.hidden ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full border-black/10 bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-white dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
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
                className="h-8 w-8 rounded-full border-black/10 bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                onClick={(e) => onDeleteProject(e, project)}
              >
                <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <FrameBorders />

          <div className="relative overflow-hidden bg-gradient-to-br from-[#D2CEC8] to-[#A8A49D] p-6 md:p-7 dark:from-[#3A352E] dark:to-[#1A1A1A]">
            <FrameScrews />
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-white shadow-[0_0_10px_rgba(0,0,0,0.2)] md:aspect-[16/10] dark:bg-[#1A1A1A]">
              <img
                src={project.thumbnail?.url || ""}
                alt={project.title || "Project"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {project.hidden && (
                <div className="absolute top-2 left-2 z-40 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  <EyeOff className="h-3 w-3" /> Hidden from live site
                </div>
              )}
            </div>
          </div>

          <div className="relative z-20 flex-1 border-t border-[#D5D0C6] bg-white p-4 md:p-5 dark:border-[#3A352E] dark:bg-[#1A1A1A]">
            <h3 className="font-jetbrains mb-2 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              {project.title}
            </h3>
            <p className="font-jetbrains text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
              {project.description}
            </p>
          </div>
        </div>
      ))}
      {isEditing && (
        <div className={`relative flex flex-col ${frameBorderClass}`}>
          <FrameBorders />
          <div className="relative flex min-h-[140px] flex-1 flex-col items-center justify-center gap-3 overflow-hidden bg-white/50 p-6 md:min-h-[180px] md:p-8 dark:bg-[#1A1A1A]/50">
            <FrameScrews />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[#D5D0C6] bg-[#EFECE6] dark:border-[#3A352E] dark:bg-[#2A2520]">
              <Plus className="h-4 w-4 text-[#7A736C] dark:text-[#9E9893]" />
            </div>
            <p className="font-jetbrains text-[10px] font-medium tracking-widest text-[#A09890] uppercase dark:text-[#5A5550]">
              New project slot
            </p>
            <div className="flex items-center gap-2">
              <Button
                className="font-jetbrains flex h-8 items-center gap-1.5 rounded-full bg-[#1A1A1A] px-3.5 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddProject();
                }}
              >
                <Pencil className="h-3 w-3" />
                Add Project
              </Button>
              <Button
                variant="outline"
                className="font-jetbrains flex h-8 items-center gap-1.5 rounded-full border-[#D5D0C6] bg-[#EFECE6] px-3.5 text-[12px] font-medium text-[#7A736C] transition-colors hover:bg-[#E5E0D8] hover:text-[#1A1A1A] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#9E9893] dark:hover:bg-[#2A2520] dark:hover:text-[#F0EDE7]"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(modals.aiProject);
                }}
              >
                <Sparkles className="h-3 w-3" />
                Write with AI
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ProfessionalProjectsTab);

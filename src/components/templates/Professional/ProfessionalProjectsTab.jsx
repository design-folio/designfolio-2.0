import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { screwClass, frameBorderClass } from "./professional-utils";

const ScrewDot = ({ className }) => (
  <div className={`absolute ${className} ${screwClass}`} />
);

const FrameScrews = () => (
  <>
    <ScrewDot className="top-3 left-3 md:top-3.5 md:left-3.5" />
    <ScrewDot className="top-3 right-3 md:top-3.5 md:right-3.5" />
    <ScrewDot className="bottom-3 left-3 md:bottom-3.5 md:left-3.5" />
    <ScrewDot className="bottom-3 right-3 md:bottom-3.5 md:right-3.5" />
  </>
);

const FrameBorders = () => (
  <>
    <div className="absolute inset-[-16px] md:inset-[-20px] border border-[#D5D0C6] dark:border-[#3A352E] pointer-events-none" />
    <div className="absolute inset-0 border border-[#D5D0C6] dark:border-[#3A352E] pointer-events-none z-30" />
  </>
);

function ProfessionalProjectsTab({
  isEditing,
  visibleProjects,
  onAddProject,
  onProjectClick,
  onEditProject,
  onDeleteProject,
}) {
  return (
    <div className="grid grid-cols-1 gap-0">
      {isEditing && (
        <div
          className={`group cursor-pointer relative flex flex-col ${frameBorderClass}`}
          onClick={onAddProject}
        >
          <FrameBorders />
          <div className="bg-white/50 dark:bg-[#1A1A1A]/50 p-6 md:p-7 relative overflow-hidden flex-1 flex flex-col items-center justify-center min-h-[120px] md:min-h-[160px]">
            <FrameScrews />
            <div className="flex flex-col items-center justify-center gap-3 mt-4 mb-4">
              <div className="w-12 h-12 rounded-full border border-dashed border-[#D5D0C6] dark:border-[#3A352E] flex items-center justify-center text-[#7A736C] dark:text-[#9E9893] group-hover:border-[#1A1A1A] dark:group-hover:border-[#F0EDE7] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors bg-white dark:bg-[#2A2520] shadow-sm">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-jetbrains text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors uppercase tracking-wider">
                Add New Project
              </span>
            </div>
          </div>
        </div>
      )}

      {visibleProjects.map((project) => (
        <div
          key={project._id}
          onClick={() => onProjectClick(project)}
          className={`group cursor-pointer relative flex flex-col ${frameBorderClass}`}
        >
          {isEditing && (
            <div className="absolute top-4 right-4 z-40 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                onClick={(e) => onDeleteProject(e, project)}
              >
                <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <FrameBorders />

          <div className="bg-gradient-to-br from-[#D2CEC8] to-[#A8A49D] dark:from-[#3A352E] dark:to-[#1A1A1A] p-6 md:p-7 relative overflow-hidden">
            <FrameScrews />
            <div className="w-full aspect-[16/9] md:aspect-[16/10] relative overflow-hidden bg-white dark:bg-[#1A1A1A] shadow-[0_0_10px_rgba(0,0,0,0.2)]">
              <img
                src={project.thumbnail?.url || ""}
                alt={project.title || "Project"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-4 md:p-5 relative z-20 border-t border-[#D5D0C6] dark:border-[#3A352E] flex-1">
            <h3 className="font-jetbrains text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2">
              {project.title}
            </h3>
            <p className="font-jetbrains text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(ProfessionalProjectsTab);

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { ProjectVisibilityButton } from "@/components/section";
import { _updateProject } from "@/network/post-request";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { modals, sidebars } from "@/lib/constant";
import { useRouter } from "next/router";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";
import ProjectLock from "@/components/projectLock";

export default function ChatProjectsSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
  preview,
  isEditing,
}) {
  const {
    userDetails,
    setUserDetails,
    openModal,
    openSidebar,
    setSelectedProject,
    updateCache,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
  } = useGlobalContext();
  const router = useRouter();
  const { projects = [] } = userDetails || {};
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const visibleProjects = useMemo(
    () => isEditing ? (projects || []) : (projects || []).filter((p) => !p.hidden),
    [projects, isEditing],
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
  const getProjectHref = useCallback(
    (id) => (isEditing ? `/project/${id}/editor` : `/project/${id}`),
    [isEditing],
  );

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps.projects - 3 }}
    >
      {/* You: "Can I see your work?" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(7) &&
          (visibleProjects.length > 0 || canEdit) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end relative group/msg"
            >
              <YouPrompt>Can I see your work?</YouPrompt>
            </motion.div>
          )}
      </AnimatePresence>

      {/* "And here's some recent work" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(8) &&
          (visibleProjects.length > 0 || canEdit) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                <ChatAvatar
                  avatarSrc={avatarSrc}
                  show={chatRevealStep < s(9)}
                />
              </div>
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-100 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                {chatRevealStep === s(8) ? (
                  <TypingIndicator />
                ) : (
                  "And here's some recent work"
                )}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Project cards */}
      {visibleProjects.map((project, index) => (
        <AnimatePresence mode="popLayout" key={project._id}>
          {chatRevealStep >= s(9) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                {index === visibleProjects.length - 1 &&
                  chatRevealStep < getNextLeftStep("projects") && (
                    <ChatAvatar avatarSrc={avatarSrc} />
                  )}
              </div>
              <div className="w-full min-w-0">
                <div
                  onClick={() => router.push(getProjectHref(project._id))}
                  className="bg-[#E5E2DB] dark:bg-[#2A2520] p-3 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full cursor-pointer hover:shadow-md hover:scale-[1.01] transform group/proj relative"
                >
                  {/* Actions — inside card, top-right */}
                  {canEdit && (
                    <div
                      className={`absolute top-3 right-3 z-40 flex gap-1.5 transition-opacity ${project.hidden ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover/proj:opacity-100"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(getProjectHref(project._id));
                        }}
                      >
                        <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <ProjectVisibilityButton
                        isHidden={!!project.hidden}
                        iconSize="w-3 h-3"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); handleToggleProjectVisibility(project._id); }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          openModal(modals.deleteProject);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}

                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 relative bg-[#D5D0C6] dark:bg-[#1A1A1A]">
                    <img
                      src={project?.thumbnail?.url}
                      alt={project?.title || "project"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/proj:scale-110"
                    />
                    {project.hidden && (
                      <div className="absolute top-2 left-2 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Hidden from live site
                      </div>
                    )}
                  </div>
                  <h3 className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px] mb-1 px-1 line-clamp-2">
                    {project?.title}
                  </h3>
                  <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[14px] leading-relaxed px-1 line-clamp-2">
                    {project?.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Add project card / Project lock — after all project cards */}
      {canEdit && chatRevealStep >= s(8) && visibleProjects.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: visibleProjects.length * 0.2 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 shrink-0" />
            {userDetails?.pro || visibleProjects.length < 2 ? (
              <div className="w-full bg-[#E5E2DB] dark:bg-[#2A2520] p-3 rounded-2xl rounded-tl-sm rounded-bl-sm border border-dashed border-black/15 dark:border-white/10">
                <div className="w-full aspect-[16/9] rounded-xl flex flex-col items-center justify-center gap-3 bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                  </div>
                  <p className="text-[11px] font-medium text-[#A09890] dark:text-[#7A736C] tracking-widest uppercase">New project</p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openSidebar(sidebars.project)}
                      className="h-8 px-3.5 rounded-full text-[12px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Pencil className="w-3 h-3" />
                      Add Project
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openModal(modals.aiProject)}
                      className="h-8 px-3.5 rounded-full text-[12px] font-medium bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors flex items-center gap-1.5 text-[#1A1A1A] dark:text-[#F0EDE7]"
                    >
                      <Sparkles className="w-3 h-3" />
                      Write with AI
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <ProjectLock className="min-h-[200px]" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Projects empty state */}
      {visibleProjects.length === 0 && chatRevealStep >= s(8) && canEdit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 max-w-[85%]"
        >
          <div className="w-8 h-8 shrink-0" />
          <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-background backdrop-blur-sm">
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
            {canEdit && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={() => openSidebar(sidebars.project)}
                  className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Write from Scratch
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openModal(modals.aiProject)}
                  className="h-9 px-5 rounded-full text-[13px] font-medium bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors flex items-center gap-2 text-[#1A1A1A] dark:text-[#F0EDE7]"
                >
                  Write using AI
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

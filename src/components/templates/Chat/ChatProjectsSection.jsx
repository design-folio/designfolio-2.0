import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { ProjectVisibilityButton } from "@/components/section";
import { _updateProject } from "@/network/post-request";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { modals, sidebars } from "@/lib/constant";
import { useRouter } from "next/router";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

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
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);
  const visibleProjects = useMemo(
    () => (isEditing ? projects || [] : (projects || []).filter((p) => !p.hidden)),
    [projects, isEditing]
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
  const getProjectHref = useCallback(
    (id) => (isEditing ? `/project/${id}/editor` : `/project/${id}`),
    [isEditing]
  );

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps.projects - 3 }}>
      {/* You: "Can I see your work?" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(7) && (visibleProjects.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
          >
            <YouPrompt>Can I see your work?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "And here's some recent work" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(8) && (visibleProjects.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex max-w-[85%] gap-3"
          >
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < s(9)} />
            </div>
            <div className="flex min-h-[46px] items-center rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 text-[15px] leading-relaxed text-[#1A1A1A] transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
              {chatRevealStep === s(8) ? <TypingIndicator /> : "And here's some recent work"}
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
              className="group/msg relative flex max-w-[85%] gap-3"
            >
              <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
                {index === visibleProjects.length - 1 &&
                  chatRevealStep < getNextLeftStep("projects") && (
                    <ChatAvatar avatarSrc={avatarSrc} />
                  )}
              </div>
              <div className="w-full min-w-0">
                <div
                  onClick={() => router.push(getProjectHref(project._id))}
                  onMouseEnter={() => router.prefetch(getProjectHref(project._id))}
                  className="group/proj relative w-full transform cursor-pointer rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-3 transition-colors duration-700 hover:scale-[1.01] hover:shadow-md dark:border-white/5 dark:bg-[#2A2520]"
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
                        className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(getProjectHref(project._id));
                        }}
                      >
                        <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <ProjectVisibilityButton
                        isHidden={!!project.hidden}
                        iconSize="w-3 h-3"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProjectVisibility(project._id);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          openModal(modals.deleteProject);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}

                  <div className="relative mb-3 aspect-[3/2] w-full overflow-hidden rounded-xl bg-[#D5D0C6] dark:bg-[#1A1A1A]">
                    <img
                      src={project?.thumbnail?.url}
                      alt={project?.title || "project"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/proj:scale-110"
                    />
                    {project.hidden && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        <EyeOff className="h-3 w-3" /> Hidden from live site
                      </div>
                    )}
                  </div>
                  <h3 className="mb-1 line-clamp-2 px-1 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                    {project?.title}
                  </h3>
                  <p className="line-clamp-2 px-1 text-[14px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
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
            className="flex max-w-[85%] gap-3"
          >
            <div className="h-8 w-8 shrink-0" />
            <div className="w-full rounded-2xl rounded-tl-sm rounded-bl-sm border border-dashed border-black/15 bg-[#E5E2DB] p-3 dark:border-white/10 dark:bg-[#2A2520]">
              <div className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.05]">
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
                    <Pencil className="h-3 w-3" />
                    Add Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openModal(modals.aiProject)}
                    className="flex h-8 items-center gap-1.5 rounded-full border-black/10 bg-white px-3.5 text-[12px] font-medium text-[#1A1A1A] shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
                  >
                    <Sparkles className="h-3 w-3" />
                    Write with AI
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Projects empty state */}
      {visibleProjects.length === 0 && chatRevealStep >= s(8) && canEdit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-[85%] gap-3"
        >
          <div className="h-8 w-8 shrink-0" />
          <div className="bg-background flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center backdrop-blur-sm dark:border-white/10">
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
            {canEdit && (
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  onClick={() => openSidebar(sidebars.project)}
                  className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Write from Scratch
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openModal(modals.aiProject)}
                  className="flex h-9 items-center gap-2 rounded-full border-black/10 bg-white px-5 text-[13px] font-medium text-[#1A1A1A] shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
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

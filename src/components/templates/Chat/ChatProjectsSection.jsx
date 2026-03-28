import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { _updateProject } from "@/network/post-request";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { modals, sidebars } from "@/lib/constant";
import { useRouter } from "next/router";
import { TypingIndicator, ChatAvatar } from "./chatUtils";

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
      {/* Recent work prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(7) &&
          !(preview && visibleProjects.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              {canEdit && chatRevealStep >= s(8) && (
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                <ChatAvatar
                  avatarSrc={avatarSrc}
                  show={chatRevealStep < s(8)}
                />
              </div>
              <div className="bg-white dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-400 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                {chatRevealStep === s(7) ? (
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
          {chatRevealStep >= s(8) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
              className="flex gap-3 max-w-[72%] relative group/msg"
            >
              {canEdit && (
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleProjectVisibility(project._id);
                    }}
                  >
                    {project.hidden
                      ? <EyeOff className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      : <Eye className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    }
                  </Button>
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
              <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                {index === visibleProjects.length - 1 &&
                  chatRevealStep < getNextLeftStep("projects") && (
                    <ChatAvatar avatarSrc={avatarSrc} />
                  )}
              </div>
              <div className="flex flex-col w-full min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="144"
                  height="19"
                  fill="none"
                  className="text-white dark:text-[#2A2520] relative z-10 -mb-[1px] "
                >
                  <path
                    fill="currentColor"
                    d="M0 18.868c0-9.941 8.059-18 18-18h75.054a51 51 0 0 1 20.928 4.492L144 18.868z"
                  ></path>
                </svg>
                <div
                  onClick={() => router.push(getProjectHref(project._id))}
                  className="bg-white dark:bg-[#2A2520] p-3 rounded-2xl rounded-tl-none rounded-bl-sm transition-colors duration-400 border border-black/5 dark:border-white/5 border-t-0 w-full cursor-pointer  group/proj"
                >
                  <div className="w-full aspect-[2/1] rounded-xl overflow-hidden mb-3 relative bg-[#D5D0C6] dark:bg-[#1A1A1A]">
                    <img
                      src={project?.thumbnail?.url}
                      alt={project?.title || "project"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/proj:scale-110"
                    />
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

      {/* Projects empty state */}
      {visibleProjects.length === 0 && chatRevealStep >= s(8) && !preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 max-w-[85%]"
        >
          <div className="w-8 h-8 shrink-0" />
          <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520]/50 backdrop-blur-sm">
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

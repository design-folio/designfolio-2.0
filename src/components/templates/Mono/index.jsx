"use client";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import ProjectLock from "@/components/projectLock";
import { SectionVisibilityButton, ProjectVisibilityButton } from "@/components/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useGlobalContext } from "@/context/globalContext";
import { _updateProject } from "@/network/post-request";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";
import {
  DEFAULT_SECTION_ORDER,
  modals,
  normalizeSectionOrder,
  sidebars,
} from "@/lib/constant";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { AnimatePresence, motion } from "framer-motion";
import {
  AtSignIcon,
  DownloadIcon,
  DribbbleIcon,
  TwitterIcon,
} from "lucide-animated";
import {
  ChevronsUpDown,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserCircle,
  X
} from "lucide-react";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";
import MonoContactSection from "./MonoContactSection";
import MonoExperienceSection from "./MonoExperienceSection";
import MonoReviewsSection from "./MonoReviewsSection";
import { MonoRearrangeButton } from "./MonoRearrangeButton";

const itemVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    y: 10,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

// Matches the "Minimal" template reveal: parent staggers children.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

function getInitials(name, fallback = "U") {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || fallback;
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase() || fallback;
}

const Mono = ({ isEditing, preview = false, publicView = false }) => {
  const router = useRouter();
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
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const atSignRef = useRef(null);
  const downloadRef = useRef(null);
  const dribbbleRef = useRef(null);
  const twitterRef = useRef(null);

  const [isRecommendationsPanelOpen, setIsRecommendationsPanelOpen] =
    useState(false);
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
  const [isProjectsAddDropdownOpen, setIsProjectsAddDropdownOpen] =
    useState(false);
  const [isProjectPasswordEnabled, setIsProjectPasswordEnabled] =
    useState(false);
  const mappedProjects = useMemo(
    () =>
      (userDetails?.projects || []).map((project, index) => ({
        id: project._id || project.id || `project-${index}`,
        slug: project._id || project.id || project.slug || "",
        title: project.title || "Untitled project",
        description: project.description || "",
        image: project?.thumbnail?.url || project?.thumbnail || "",
        hidden: Boolean(project.hidden),
        raw: project,
      })),
    [userDetails?.projects],
  );
  const [projects, setProjects] = useState(mappedProjects);
  const mappedStoryImages = useMemo(() => {
    const images =
      userDetails?.about?.pegboardImages?.length > 0
        ? userDetails.about.pegboardImages
        : DEFAULT_PEGBOARD_IMAGES;
    return images.map((image) => image?.src || image?.key || "").slice(0, 4);
  }, [userDetails?.about?.pegboardImages]);
  const [storyImages, setStoryImages] = useState(mappedStoryImages);
  const [selectedStoryImage, setSelectedStoryImage] = useState(null);

  const mappedTools = useMemo(
    () =>
      (userDetails?.tools || []).map((tool, index) => ({
        name: tool.label || tool.name || `Tool ${index + 1}`,
        icon: tool.image || tool.icon || "",
      })),
    [userDetails?.tools],
  );
  const [activeTools, setActiveTools] = useState(mappedTools);


  const displayName =
    userDetails?.name ||
    userDetails?.fullName ||
    userDetails?.username ||
    userDetails?.userName ||
    "";
  const introduction = userDetails?.introduction || "Hey there";
  const bio = userDetails?.bio || "";
  const email = userDetails?.contact_email || userDetails?.email || "";
  const socials = userDetails?.socials || {};
  const portfolios = userDetails?.portfolios || {};
  const resumeUrl = userDetails?.resume?.url || "";
  const storyText = userDetails?.about?.description || "";
  const userRole = userDetails?.persona?.label !== "Others" ? userDetails?.persona?.label : userDetails?.persona?.custom;
  const visibleProjects = useMemo(
    () => (preview ? projects.filter((project) => !project.hidden) : projects),
    [preview, projects],
  );
  const avatarFallbackText = useMemo(
    () => getInitials(displayName, "U"),
    [displayName],
  );


  useEffect(() => {
    setProjects(mappedProjects);
  }, [mappedProjects]);


  useEffect(() => {
    setActiveTools(mappedTools);
  }, [mappedTools]);

  useEffect(() => {
    setStoryImages(mappedStoryImages);
  }, [mappedStoryImages]);


  const handleOpenProjectEditor = useCallback(
    (project) => {
      const projectId = project?.raw?._id || project?.id;
      if (!projectId) return;
      router.push(`/project/${projectId}/editor`);
    },
    [router],
  );

  const handleDeleteProject = useCallback(
    (project) => {
      setSelectedProject?.(project?.raw || project);
      openModal?.(modals.deleteProject);
    },
    [openModal, setSelectedProject],
  );

  const handleEditPersona = useCallback(
    () => openSidebar?.(sidebars.persona),
    [openSidebar],
  );

  const handleToggleProjectVisibility = useCallback(
    (projectId) => {
      const allProjects = userDetails?.projects || [];
      const project = allProjects.find((p) => p._id === projectId);
      if (!project) return;
      const visibleCount = allProjects.filter((p) => !p.hidden).length;
      const isUnhiding = project.hidden === true;

      if (!userDetails?.pro && isUnhiding && visibleCount >= 2) {
        setUpgradeModalUnhideProject({ projectId, title: project.title || "Project" });
        setShowUpgradeModal(true);
        return;
      }

      const updatedProjects = allProjects.map((p) =>
        p._id === projectId ? { ...p, hidden: !p.hidden } : p
      );
      _updateProject(projectId, { hidden: !project.hidden });
      setUserDetails((prev) => ({ ...prev, projects: updatedProjects }));
      updateCache("userDetails", (prev) => ({ ...prev, projects: updatedProjects }));
    },
    [userDetails, setUserDetails, updateCache, setShowUpgradeModal, setUpgradeModalUnhideProject],
  );

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      if (isRecommendationsPanelOpen || isProjectsPanelOpen) {
        root.classList.add("theme-panel-open");
      } else {
        root.classList.remove("theme-panel-open");
      }
    }
    return () => {
      if (root) root.classList.remove("theme-panel-open");
    };
  }, [isRecommendationsPanelOpen, isProjectsPanelOpen]);


  useEffect(() => {
    if (isRecommendationsPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "recommendations" }),
      );
    }
    if (isProjectsPanelOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "projects" }),
      );
    }
  }, [isRecommendationsPanelOpen, isProjectsPanelOpen]);

  useEffect(() => {
    const handlePanelOpened = (e) => {
      const customEvent = e;
      if (customEvent.detail !== "recommendations") {
        setIsRecommendationsPanelOpen(false);
      }
      if (customEvent.detail !== "projects") {
        setIsProjectsPanelOpen(false);
      }
    };
    window.addEventListener("panelOpened", handlePanelOpened);
    return () => window.removeEventListener("panelOpened", handlePanelOpened);
  }, []);

  const handleProjectClick = (projectId) => {
    if (isEditing) router.push(`/project/${projectId}/editor`);
    else if (preview && !publicView)
      router.push(`/project/${projectId}/preview`);
    else router.push(`/project/${projectId}`);
  };

  // Dino Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoY, setDinoY] = useState(0);
  const [obstacles, setObstacles] = useState([]);

  const dinoYRef = useRef(0);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);

  const requestRef = useRef(0);
  const lastTimeRef = useRef(undefined);
  const gameRef = useRef(null);

  const jump = useCallback(() => {
    if (isGameOver) {
      setIsPlaying(true);
      setIsGameOver(false);
      scoreRef.current = 0;
      obstaclesRef.current = [];
      dinoYRef.current = 0;
      velocityRef.current = 0;
      setScore(0);
      setObstacles([]);
      setDinoY(0);
      return;
    }
    if (!isPlaying) {
      setIsPlaying(true);
      scoreRef.current = 0;
      obstaclesRef.current = [];
      dinoYRef.current = 0;
      velocityRef.current = 0;
      setScore(0);
      setObstacles([]);
      setDinoY(0);
      return;
    }
    if (dinoYRef.current === 0) {
      velocityRef.current = 11; // Jump strength
      dinoYRef.current = 0.1; // trigger jump
    }
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const update = (time) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = Math.min(time - lastTimeRef.current, 32);

        scoreRef.current += 1;

        // Physics update
        if (dinoYRef.current > 0 || velocityRef.current !== 0) {
          dinoYRef.current += velocityRef.current * (deltaTime / 16);
          velocityRef.current -= 0.6 * (deltaTime / 16); // Gravity

          if (dinoYRef.current <= 0) {
            dinoYRef.current = 0;
            velocityRef.current = 0;
          }
        }

        // Obstacles update
        let newObstacles = obstaclesRef.current
          .map((obs) => ({ ...obs, x: obs.x - 5.5 * (deltaTime / 16) })) // speed
          .filter((obs) => obs.x > -50);

        const lastObsX =
          newObstacles.length > 0 ? newObstacles[newObstacles.length - 1].x : 0;
        if (
          newObstacles.length === 0 ||
          (lastObsX < 400 && Math.random() < 0.02)
        ) {
          newObstacles.push({ id: Date.now(), x: 700 });
        }

        obstaclesRef.current = newObstacles;

        // Collision check
        const dinoLeft = 52; // roughly left-12 (48) + some padding
        const dinoRight = 80;
        const dinoBottom = dinoYRef.current;

        let hit = false;
        for (const obs of newObstacles) {
          const obsLeft = obs.x + 4;
          const obsRight = obs.x + 20;
          const obsTop = 28; // height of cactus

          if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom < obsTop
          ) {
            hit = true;
            break;
          }
        }

        if (hit) {
          setIsGameOver(true);
          setIsPlaying(false);
          setHighScore((current) =>
            Math.max(current, Math.floor(scoreRef.current / 10)),
          );
        } else {
          // Sync state for rendering
          setScore(scoreRef.current);
          setDinoY(dinoYRef.current);
          setObstacles(newObstacles);
        }
      }

      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = undefined;
    };
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);


  const sectionOrder = normalizeSectionOrder(
    userDetails?.sectionOrder,
    DEFAULT_SECTION_ORDER,
  );
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionVisible = (id) => isEditing || !hiddenSections.includes(id);

  const sectionComponents = {
    works: (
      <React.Fragment key="works">
        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Experience Section — using MonoExperienceSection */}
        <MonoExperienceSection isEditing={isEditing} />
      </React.Fragment>
    ),
    projects: !isEditing && visibleProjects.length === 0 ? null : (
      <React.Fragment key="projects">
        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Projects Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 pb-16 relative group/section"
        >
          {isEditing && (
            <div
              className="absolute top-4 right-4 z-10 transition-opacity flex gap-2"
            >
              {(userDetails?.pro || visibleProjects.length < 2) && <DropdownMenu
                open={isProjectsAddDropdownOpen}
                onOpenChange={setIsProjectsAddDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors ${isProjectsAddDropdownOpen
                      ? "opacity-100"
                      : "opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
                      }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white dark:bg-[#2A2520] border border-black/10 dark:border-white/10 shadow-lg rounded-xl overflow-hidden p-1"
                >
                  <DropdownMenuItem
                    onClick={() => openSidebar?.(sidebars.project)}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Write from Scratch</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openModal?.(modals.aiProject)}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Write using AI</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}

              <Sheet
                modal={false}
                open={isProjectsPanelOpen}
                onOpenChange={setIsProjectsPanelOpen}
              >
                <SheetContent
                  className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                  hasOverlay={false}
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                    <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                      Add Project
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="proj-title"
                          className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                        >
                          Project Title
                        </Label>
                        <Input
                          id="proj-title"
                          placeholder="e.g. Slate"
                          className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="proj-desc"
                          className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1"
                        >
                          Description
                        </Label>
                        <textarea
                          id="proj-desc"
                          rows={3}
                          placeholder="Short description of the project"
                          className="w-full bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all p-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30 resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                          Cover Image
                        </Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                            <Plus className="w-5 h-5 text-[#7A736C] dark:text-[#9E9893]" />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-[12px] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            Upload Image
                          </Button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                              Protect Project
                            </Label>
                            <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] ml-1">
                              Require a password to view this project (e.g., for
                              NDAs).
                            </p>
                          </div>
                          <Switch
                            checked={isProjectPasswordEnabled}
                            onCheckedChange={setIsProjectPasswordEnabled}
                          />
                        </div>
                        <AnimatePresence>
                          {isProjectPasswordEnabled && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                height: 0,
                                marginTop: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: 12,
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1.5 px-1">
                                <Input
                                  id="proj-password"
                                  type="password"
                                  placeholder="Enter password"
                                  className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all px-3.5 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm">
                        Add Project
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
              {visibleProjects.length >= 2 && (
                <MonoRearrangeButton
                  onClick={() => openSidebar(sidebars.sortProjects)}
                  title="Rearrange projects"
                  tooltipText="Rearrange"
                />

              )}
              <SectionVisibilityButton
                sectionId="projects"
                showOnHoverWhenVisible
                className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A]"
              />
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-4">
            Projects
          </h2>

          {visibleProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-background backdrop-blur-sm">
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
                    onClick={() => openSidebar?.(sidebars.project)}
                    className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Write from Scratch
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openModal?.(modals.aiProject)}
                    className="h-9 px-5 rounded-full text-[13px] font-medium border-button-outline hover:border-button-outline-hover"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Write using AI
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
                {visibleProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.slug)}
                    className="group cursor-pointer flex flex-col p-4 -m-4 rounded-2xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-300 relative"
                  >
                    {isEditing && (
                      <div
                        className={`absolute top-8 right-8 z-10 flex gap-2 transition-opacity ${project.hidden ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProjectEditor(project);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                        <ProjectVisibilityButton
                          isHidden={!!project.hidden}
                          onClick={(e) => { e.stopPropagation(); handleToggleProjectVisibility(project.raw?._id || project.id); }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                      </div>
                    )}
                    <div className="rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-white dark:bg-[#2A2520] drop-shadow-sm border border-black/5 dark:border-white/10 group-hover:border-black/10 dark:group-hover:border-white/20 transition-colors relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {project.hidden && (
                        <div className="absolute top-2 left-2 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 z-10">
                          <EyeOff className="w-3 h-3" /> Hidden from live site
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-base mb-1.5 text-[#1A1A1A] dark:text-[#F0EDE7]">
                      {project.title}
                    </h3>
                    <p
                      className="text-base text-[#7A736C] dark:text-[#B5AFA5] leading-relaxed"
                      style={{ fontWeight: 450 }}
                    >
                      {project.description}
                    </p>
                  </div>
                ))}
                {isEditing && !(userDetails?.pro || visibleProjects.length < 2) && (
                  <div className="sm:col-span-2">
                    <ProjectLock />
                  </div>
                )}
              </div>

              {/* <div className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] px-3 py-1.5 rounded-full text-[13px] font-medium shadow-2xl flex items-center gap-1.5">
                                View Project <ArrowUpRight size={14} />
                            </div> */}
            </>
          )}
        </motion.div>
      </React.Fragment>
    ),
    reviews: (
      <React.Fragment key="reviews">
        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Recommendations Section — using MonoReviewsSection */}
        <MonoReviewsSection isEditing={isEditing} />
      </React.Fragment>
    ),
    about: (
      <React.Fragment key="about">
        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* My Story Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 pb-16 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar?.(sidebars.about)}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
              <SectionVisibilityButton
                sectionId="about"
                showOnHoverWhenVisible
                className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A]"
              />
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
            My Story
          </h2>

          <div className="relative mb-8 h-56 flex items-center justify-center">
            <motion.div
              initial={{ rotate: -8, x: -120, y: 0 }}
              whileHover={{ rotate: -2, scale: 1.1, zIndex: 50 }}
              onClick={() =>
                storyImages[0] && setSelectedStoryImage(storyImages[0])
              }
              className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-0 cursor-pointer"
            >
              <img
                src={storyImages[0]}
                alt="My workspace"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ rotate: 12, x: -40, y: 15 }}
              whileHover={{ rotate: 5, scale: 1.1, zIndex: 50 }}
              onClick={() =>
                storyImages[1] && setSelectedStoryImage(storyImages[1])
              }
              className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-10 cursor-pointer"
            >
              <img
                src={storyImages[1]}
                alt="Designing"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ rotate: -5, x: 40, y: -10 }}
              whileHover={{ rotate: 0, scale: 1.1, zIndex: 50 }}
              onClick={() =>
                storyImages[2] && setSelectedStoryImage(storyImages[2])
              }
              className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-20 cursor-pointer"
            >
              <img
                src={storyImages[2]}
                alt="Coffee and notes"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ rotate: 8, x: 120, y: 20 }}
              whileHover={{ rotate: 3, scale: 1.1, zIndex: 50 }}
              onClick={() =>
                storyImages[3] && setSelectedStoryImage(storyImages[3])
              }
              className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-30 cursor-pointer"
            >
              <img
                src={storyImages[3]}
                alt="Creative studio"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
          <p className="mb-8 -mt-2 text-center text-[10px] font-medium tracking-widest uppercase text-[#7A736C]/70 dark:text-[#B5AFA5]/60 pointer-events-none">
            Try moving things around :)
          </p>

          <div className="space-y-6 text-[#7A736C] dark:text-[#B5AFA5] text-base leading-[1.7]">
            {storyText ? (
              storyText
                .split("\n")
                .filter(Boolean)
                .map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
            ) : isEditing ? (
              <button
                onClick={() => openSidebar?.(sidebars.about)}
                className="text-left text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
              >
                Click here to add your story...
              </button>
            ) : null}
          </div>
        </motion.div>
      </React.Fragment>
    ),
    tools: !isEditing && activeTools.length === 0 ? null : (
      <React.Fragment key="tools">
        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Stack Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openSidebar?.(sidebars.tools);
                }}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
              <SectionVisibilityButton
                sectionId="tools"
                showOnHoverWhenVisible
                className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A]"
              />
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
            Stack
          </h2>
          {activeTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                No tools yet
              </h3>
              <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                Add tools to showcase your stack and workflow.
              </p>
              {isEditing && (
                <Button
                  onClick={() => openSidebar?.(sidebars.tools)}
                  className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
                >
                  Add Tools
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 items-center">
              {activeTools.map((tool, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer relative group/tool"
                >
                  <img
                    src={tool.icon}
                    alt={tool.name}
                    className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </React.Fragment>
    ),
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pb-0 pt-0 px-4 md:px-0 max-w-[640px] mx-auto">
      <motion.div
        className={
          "w-full max-w-[640px] relative min-h-screen flex flex-col font-inter transition-colors duration-700 bg-[#F0EDE7] dark:bg-[#1A1A1A] custom-dashed-x"
        }
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {!isEditing && <SmoothCursor type="minimal" />}
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar?.(sidebars.profile)}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                title="Edit Profile"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>

            </div>
          )}
          <div className="flex items-start justify-between gap-4 mb-6">
            <Avatar className="w-[80px] h-[80px] rounded-2xl">
              <AvatarImage
                src={avatarSrc}
                alt={displayName || "Profile image"}
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl bg-[#E5D7C4] dark:bg-[#3A352E] text-[#1A1A1A] dark:text-[#F0EDE7]">
                {avatarFallbackText}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 mt-1">
              <AnimatedThemeToggler persist={isEditing && !preview} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
            <div>
              <h1 className="text-[24px] font-semibold mb-0.5 tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]">
                {introduction}
              </h1>
              {isEditing ? (
                <div className="flex items-center gap-2 group/role">

                  <p
                    className="text-[#7A736C] dark:text-[#B5AFA5] text-base"
                    style={{ fontWeight: 450 }}
                  >
                    {userRole}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] opacity-0 group-hover/role:opacity-100 transition-opacity shrink-0"
                    onClick={handleEditPersona}
                    title="Edit persona"
                  >
                    <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              ) : (
                <p
                  className="text-[#7A736C] dark:text-[#B5AFA5] text-base"
                  style={{ fontWeight: 450 }}
                >
                  {userRole}
                </p>
              )}
            </div>
            <a
              href={resumeUrl || "#"}
              target={resumeUrl ? "_blank" : undefined}
              rel={resumeUrl ? "noopener noreferrer" : undefined}
              className="text-[13px] font-medium flex items-center gap-1.5 border-b border-[#1A1A1A] dark:border-[#F0EDE7] pb-0.5 hover:opacity-70 transition-opacity w-fit group/download text-[#1A1A1A] dark:text-[#F0EDE7]"
              onMouseEnter={() => downloadRef.current?.startAnimation()}
              onMouseLeave={() => downloadRef.current?.stopAnimation()}
              onClick={(e) => {
                if (!resumeUrl) e.preventDefault();
              }}
            >
              Download resume <DownloadIcon ref={downloadRef} size={14} />
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Contact Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-4 flex justify-between items-center relative group/section"
        >
          {isEditing && (
            <div className="absolute top-1/2 -translate-y-1/2 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar?.(sidebars.footer)}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <a
            href={email ? `mailto:${email}` : "#"}
            className="flex items-center gap-2 text-base text-[#666666] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
            onMouseEnter={() => atSignRef.current?.startAnimation()}
            onMouseLeave={() => atSignRef.current?.stopAnimation()}
            onClick={(e) => {
              if (!email) e.preventDefault();
            }}
          >
            <AtSignIcon
              ref={atSignRef}
              size={18}
              className="transition-colors"
            />
            {email || "No email set"}
          </a>
          <div className="flex items-center gap-5 text-[#1A1A1A] dark:text-[#F0EDE7]">
            <a
              href={portfolios.dribbble || "#"}
              target={portfolios.dribbble ? "_blank" : undefined}
              rel={portfolios.dribbble ? "noopener noreferrer" : undefined}
              className="hover:opacity-70 transition-opacity"
              onMouseEnter={() => dribbbleRef.current?.startAnimation()}
              onMouseLeave={() => dribbbleRef.current?.stopAnimation()}
              onClick={(e) => {
                if (!portfolios.dribbble) e.preventDefault();
              }}
            >
              <DribbbleIcon
                ref={dribbbleRef}
                size={16}
                className="transition-colors"
              />
            </a>
            <a
              href={socials.twitter || "#"}
              target={socials.twitter ? "_blank" : undefined}
              rel={socials.twitter ? "noopener noreferrer" : undefined}
              className="hover:opacity-70 transition-opacity"
              onMouseEnter={() => twitterRef.current?.startAnimation()}
              onMouseLeave={() => twitterRef.current?.stopAnimation()}
              onClick={(e) => {
                if (!socials.twitter) e.preventDefault();
              }}
            >
              <TwitterIcon
                ref={twitterRef}
                size={16}
                className="transition-colors"
              />
            </a>
            <a
              href={socials.linkedin || "#"}
              target={socials.linkedin ? "_blank" : undefined}
              rel={socials.linkedin ? "noopener noreferrer" : undefined}
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                if (!socials.linkedin) e.preventDefault();
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
            </a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="custom-dashed-t"></motion.div>

        {/* Intro Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar?.(sidebars.profile)}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-4">
            Intro
          </h2>
          <p
            className="text-[#7A736C] dark:text-[#B5AFA5] leading-[1.7] text-base"
            style={{ fontWeight: 450 }}
          >
            {bio}
          </p>
        </motion.div>

        {sectionOrder.map((id) =>
          isSectionVisible(id) ? sectionComponents[id] : null,
        )}

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Contact Section — using MonoContactSection */}
        <MonoContactSection isEditing={isEditing} />

        <motion.div variants={itemVariants} className="custom-dashed-t"></motion.div>

        {/* Dino Game Section */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col items-center justify-center overflow-hidden border-b border-[#E5D7C4]/50"
        >
          <div className="absolute top-6 left-8 right-8 flex justify-between z-10 font-dm-mono text-[10px] uppercase tracking-widest text-[#463B34] dark:text-[#C4B5A0] pointer-events-none">
            <span>
              {isGameOver ? "Game Over" : isPlaying ? "Playing" : "Tap to play"}
            </span>
            <div className="flex gap-4">
              <span>HI {String(highScore).padStart(5, "0")}</span>
              <span>{String(Math.floor(score / 10)).padStart(5, "0")}</span>
            </div>
          </div>

          <div
            ref={gameRef}
            onClick={jump}
            className="w-full h-48 relative flex items-end overflow-hidden cursor-pointer select-none bg-black/[0.015] dark:bg-white/[0.03] transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.05]"
          >
            {/* Ground Line */}
            <div className="absolute bottom-12 left-0 w-full h-[1px] bg-[#E5D7C4] dark:bg-[#3A352E]"></div>

            {/* Dino */}
            <motion.div
              animate={{ y: -dinoY - 48 }}
              transition={{ type: "just" }}
              className="absolute left-12 bottom-0 mb-[-2px] z-20 dino-game"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 54 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
              >
                <path
                  d="M45.4502 6.75024V8.55005H47.25V18.7317H35.1006V20.2502H40.5V21.5999H35.1006V25.6497H39.1504V29.7004H37.3506V27.8997H35.1006V34.6497H33.2998V37.8H31.0498V40.05H29.25V48.1497H31.0498V49.9504H27.4502L27 43.6497H25.6504V41.8499H23.4004V43.6497H21.1504V45.8997H18.9004V48.1497H21.1504V49.9504H17.1006V41.8499H14.8506V40.05H13.0498V37.8H10.7998V35.55H9V33.3H7.2002V22.05H9V25.6497H10.7998V27.8997H13.0498V29.7004H17.1006V27.8997H19.3506V25.6497H22.0498V23.8499H25.2002V21.5999H27.1689L27.4502 8.55005H29.25V6.30005L45.4502 6.75024ZM31.0498 10.3499V14.8499H35.5498V10.3499H31.0498ZM34.6504 11.2502V13.9504H31.9502V11.2502H34.6504Z"
                  className="dino-color"
                />
                {isPlaying && dinoY === 0 && (
                  <motion.path
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    d="M18.9004 48.1497H21.1504V49.9504H17.1006V41.8499M29.25 48.1497H31.0498V49.9504H27.4502L27 43.6497"
                    fill="#F0EDE7"
                  />
                )}
              </svg>
            </motion.div>

            {/* Obstacles */}
            {obstacles.map((obs) => (
              <div
                key={obs.id}
                className="absolute bottom-12 mb-[-2px] z-10 dino-game"
                style={{ left: `${obs.x}px` }}
              >
                <svg
                  width="24"
                  height="36"
                  viewBox="0 0 20 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 30H12V0H8V30Z" className="dino-color" />
                  <path d="M4 10H8V14H4V10Z" className="dino-color" />
                  <path d="M12 5H16V9H12V5Z" className="dino-color" />
                </svg>
              </div>
            ))}

            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E5D7C4]/30 dark:via-[#3A352E]/40 to-transparent -translate-y-12"></div>

            {isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F0EDE7]/40 dark:bg-[#1A1A1A]/60 backdrop-blur-[2px] z-30">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/80 dark:bg-[#2A2520]/90 backdrop-blur-md px-8 py-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl flex flex-col items-center gap-2"
                >
                  <span className="text-[11px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-[0.2em]">
                    Game Over
                  </span>
                  <div className="flex flex-col items-center group">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#535353] dark:text-[#9E9893] mb-1 transition-transform group-hover:rotate-180 duration-500"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    <span className="text-[9px] font-medium text-[#7A736C] dark:text-[#9E9893] uppercase tracking-widest">
                      Tap to Restart
                    </span>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedStoryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStoryImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStoryImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedStoryImage}
                alt="Story full view"
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mono;

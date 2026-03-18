"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  Phone,
  Linkedin,
  Globe,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import {
  AtSignIcon,
  DownloadIcon,
  DribbbleIcon,
  TwitterIcon,
} from "lucide-animated";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedThemeToggler } from "./animated-theme-toggler";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";
import { modals, sidebars } from "@/lib/constant";

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

function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (content.type === "text") return content.text || "";
  if (content.type === "hardBreak") return "\n";
  if (Array.isArray(content)) return content.map(extractText).join("");
  if (Array.isArray(content.content))
    return content.content.map(extractText).join("");
  return "";
}

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
    openModal,
    openSidebar,
    setSelectedProject,
    setSelectedReview,
    setSelectedWork,
  } = useGlobalContext();
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const copiedTimeoutRef = useRef(null);
  const atSignRef = useRef(null);
  const downloadRef = useRef(null);
  const dribbbleRef = useRef(null);
  const twitterRef = useRef(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isStackPanelOpen, setIsStackPanelOpen] = useState(false);
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
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const mappedRecommendations = useMemo(
    () =>
      (userDetails?.reviews || []).map((review, index) => ({
        id: review._id || review.id || `review-${index}`,
        name: review.name || "Anonymous",
        role: review.company || "",
        content: extractText(review.description || ""),
        image: review?.avatar?.url || review?.avatar || "",
        raw: review,
      })),
    [userDetails?.reviews],
  );
  const [recommendations, setRecommendations] = useState(mappedRecommendations);

  const mappedTools = useMemo(
    () =>
      (userDetails?.tools || []).map((tool, index) => ({
        name: tool.label || tool.name || `Tool ${index + 1}`,
        icon: tool.image || tool.icon || "",
      })),
    [userDetails?.tools],
  );
  const [activeTools, setActiveTools] = useState(mappedTools);
  const [copiedField, setCopiedField] = useState(null);

  const mappedExperiences = useMemo(
    () =>
      (userDetails?.experiences || []).map((exp, index) => ({
        id: exp._id || exp.id || `experience-${index}`,
        year: String(exp.startYear || ""),
        company: exp.company || "",
        role: exp.role || "",
        description: extractText(exp.description || ""),
        raw: exp,
      })),
    [userDetails?.experiences],
  );

  const displayName =
    userDetails?.name ||
    userDetails?.fullName ||
    userDetails?.username ||
    userDetails?.userName ||
    "";
  const introduction = userDetails?.introduction || "Hey there";
  const bio = userDetails?.bio || "";
  const email = userDetails?.contact_email || userDetails?.email || "";
  const phone = userDetails?.phone || "";
  const socials = userDetails?.socials || {};
  const portfolios = userDetails?.portfolios || {};
  const resumeUrl = userDetails?.resume?.url || "";
  const storyText = userDetails?.about?.description || "";
  const visibleProjects = useMemo(
    () => (preview ? projects.filter((project) => !project.hidden) : projects),
    [preview, projects],
  );
  const avatarFallbackText = useMemo(
    () => getInitials(displayName, "U"),
    [displayName],
  );

  const allTools = [
    { name: "Figma", icon: "/tools/image 4.png" },
    { name: "Notion", icon: "/tools/image 5.png" },
    { name: "Raycast", icon: "/tools/image 6.png" },
    { name: "Framer", icon: "/tools/image 7.png" },
    { name: "Linear", icon: "/tools/image 8.png" },
    { name: "Slack", icon: "/tools/image 9.png" },
    { name: "Arc", icon: "/tools/image 10.png" },
    {
      name: "GitHub",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    },
    {
      name: "VS Code",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    },
    {
      name: "React",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    },
    {
      name: "TypeScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    },
    {
      name: "Tailwind",
      icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
    },
    {
      name: "Python",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    },
    {
      name: "Vercel",
      icon: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    },
    {
      name: "GitLab",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg",
    },
    {
      name: "Firebase",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
    },
  ];

  const handleAddTool = (tool) => {
    if (!activeTools.find((t) => t.name === tool.name)) {
      setActiveTools([...activeTools, tool]);
    }
  };

  const handleRemoveTool = (toolToRemove) => {
    setActiveTools(activeTools.filter((t) => t.name !== toolToRemove.name));
  };

  useEffect(() => {
    setProjects(mappedProjects);
  }, [mappedProjects]);

  useEffect(() => {
    setRecommendations(mappedRecommendations);
  }, [mappedRecommendations]);

  useEffect(() => {
    setActiveTools(mappedTools);
  }, [mappedTools]);

  useEffect(() => {
    setStoryImages(mappedStoryImages);
  }, [mappedStoryImages]);

  const handleCopy = useCallback((value, field) => {
    if (!value || !navigator?.clipboard) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const openExternalLink = useCallback((url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

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

  const handleOpenReviewSidebar = useCallback(
    (review) => {
      if (review) setSelectedReview?.(review.raw || review);
      openSidebar?.(sidebars.review);
    },
    [openSidebar, setSelectedReview],
  );

  const handleOpenWorkSidebar = useCallback(
    (experience) => {
      if (experience) setSelectedWork?.(experience.raw || experience);
      openSidebar?.(sidebars.work);
    },
    [openSidebar, setSelectedWork],
  );

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      if (
        isStackPanelOpen ||
        isRecommendationsPanelOpen ||
        isProjectsPanelOpen
      ) {
        root.classList.add("theme-panel-open");
      } else {
        root.classList.remove("theme-panel-open");
      }
    }
    return () => {
      if (root) root.classList.remove("theme-panel-open");
    };
  }, [isStackPanelOpen, isRecommendationsPanelOpen, isProjectsPanelOpen]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isStackPanelOpen) {
      window.dispatchEvent(new CustomEvent("panelOpened", { detail: "stack" }));
    }
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
  }, [isStackPanelOpen, isRecommendationsPanelOpen, isProjectsPanelOpen]);

  useEffect(() => {
    const handlePanelOpened = (e) => {
      const customEvent = e;
      if (customEvent.detail !== "stack") {
        setIsStackPanelOpen(false);
      }
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
    else if (preview && !publicView) router.push(`/project/${projectId}/preview`);
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

  const experiences = mappedExperiences;

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pb-0 pt-0 px-4 md:px-0 max-w-[640px] mx-auto">
      <div
        className={
          "w-full max-w-[640px] relative min-h-screen flex flex-col font-inter transition-colors duration-700 bg-[#F0EDE7] dark:bg-[#1A1A1A] custom-dashed-x"
        }
      >
        {/* <SmoothCursor type="minimal" /> */}
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 pt-12 md:pt-16 pb-6 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal?.("onboarding")}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
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
              <AnimatedThemeToggler />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
            <div>
              <h1 className="text-[24px] font-semibold mb-0.5 tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]">
                {introduction}
              </h1>
              <p
                className="text-[#7A736C] dark:text-[#B5AFA5] text-base"
                style={{ fontWeight: 450 }}
              >
                {userDetails?.designation ||
                  userDetails?.profession ||
                  experiences[0]?.role ||
                  "Portfolio"}
              </p>
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
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
            </a>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

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
                onClick={() => openModal?.("onboarding")}
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

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Experience Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenWorkSidebar()}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-4">
            Experience
          </h2>
          {experiences.length === 0 ? (
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
                    d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                No experience yet
              </h3>
              <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                Add your work experience to showcase your career journey.
              </p>
              {isEditing && (
                <Button
                  onClick={() => handleOpenWorkSidebar()}
                  className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
                >
                  Add Experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {experiences.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="rounded-lg transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05] -mx-3 px-3 relative group/item"
                >
                  {isEditing && (
                    <div className="absolute top-2.5 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/item:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWorkSidebar(exp);
                        }}
                      >
                        <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                    className="w-full flex justify-between items-center py-2.5 text-base group"
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ rotate: expandedIndex === index ? 45 : 0 }}
                        className="text-[#888888] dark:text-[#7A736C] font-light text-lg leading-none mt-[1px] transition-colors group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      >
                        +
                      </motion.span>
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                        <span className="text-[#7A736C] dark:text-[#9E9893]">
                          {exp.year} /{" "}
                        </span>
                        {exp.company}
                      </span>
                    </div>
                    <span className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors">
                      {exp.role}
                    </span>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-7 pr-4">
                          <motion.p
                            variants={{
                              hidden: { opacity: 0 },
                              show: {
                                opacity: 1,
                                transition: {
                                  staggerChildren: 0.015,
                                },
                              },
                            }}
                            initial="hidden"
                            animate="show"
                            className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed break-words whitespace-normal"
                          >
                            {(exp.description || "")
                              .split(" ")
                              .map((word, wordIndex) => (
                                <span
                                  key={wordIndex}
                                  className="inline-block whitespace-nowrap"
                                >
                                  {word.split("").map((char, charIndex) => (
                                    <motion.span
                                      key={charIndex}
                                      variants={{
                                        hidden: {
                                          opacity: 0,
                                          filter: "blur(10px)",
                                        },
                                        show: {
                                          opacity: 1,
                                          filter: "blur(0px)",
                                        },
                                      }}
                                      transition={{ duration: 0.3 }}
                                      className="inline-block"
                                    >
                                      {char}
                                    </motion.span>
                                  ))}
                                  {/* Add space after each word except the last one */}
                                  {wordIndex <
                                    (exp.description || "").split(" ").length -
                                    1 && (
                                      <span className="inline-block">&nbsp;</span>
                                    )}
                                </span>
                              ))}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>

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
              className={`absolute top-4 right-4 z-10 transition-opacity flex gap-2 ${isProjectsAddDropdownOpen
                  ? "opacity-100"
                  : "opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
                }`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>

              <DropdownMenu
                open={isProjectsAddDropdownOpen}
                onOpenChange={setIsProjectsAddDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
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
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>Write using AI</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                              Require a password to view this project (e.g.,
                              for NDAs).
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
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-4">
            Projects
          </h2>

          {visibleProjects.length === 0 ? (
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
                    variant="outline"
                    onClick={() => openModal?.(modals.aiProject)}
                    className="h-9 px-5 rounded-full text-[13px] font-medium bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors flex items-center gap-2 text-[#1A1A1A] dark:text-[#F0EDE7]"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
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
                        className="absolute top-8 right-8 z-10 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] group-hover/btn:text-red-600" />
                        </Button>
                      </div>
                    )}
                    <div className="rounded-xl overflow-hidden mb-4 aspect-[4/3] bg-white dark:bg-[#2A2520] drop-shadow-sm border border-black/5 dark:border-white/10 group-hover:border-black/10 dark:group-hover:border-white/20 transition-colors">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
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
              </div>

              {/* <div className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] px-3 py-1.5 rounded-full text-[13px] font-medium shadow-2xl flex items-center gap-1.5">
                                View Project <ArrowUpRight size={14} />
                            </div> */}
            </>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Recommendations Section */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenReviewSidebar()}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
            Recommendations
          </h2>

          {recommendations.length === 0 ? (
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                No recommendations yet
              </h3>
              <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                Add recommendations to build trust and credibility.
              </p>
              {isEditing && (
                <Button
                  onClick={() => handleOpenReviewSidebar()}
                  className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
                >
                  Add Testimonial
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-[#2A2520] rounded-[16px] border border-black/5 dark:border-white/10 drop-shadow-sm overflow-hidden group/card relative"
                >
                  {isEditing && (
                    <div className="absolute top-3 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReviewSidebar(rec);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7] group-hover/btn:text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#F0EDE7] dark:bg-[#1A1A1A] border-black/10 dark:border-white/10 rounded-2xl p-6 gap-6 max-w-md w-[90vw]"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                                Delete Recommendation
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-[15px] text-[#7A736C] dark:text-[#B5AFA5]">
                                Are you sure you want to delete this
                                recommendation from {rec.name}? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-3 sm:gap-2">
                              <AlertDialogCancel className="rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] m-0 h-11 px-6">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecommendations(
                                    recommendations.filter(
                                      (r) => r.id !== rec.id,
                                    ),
                                  );
                                }}
                                className="rounded-xl bg-red-600 text-white hover:bg-red-700 m-0 h-11 px-6 border-none shadow-none"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-6 py-4">
                    <div className="flex flex-col">
                      <h3 className="font-medium text-base text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                        {rec.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-black dark:text-[#F0EDE7] transition-colors duration-200 hover:text-[#0077B5] dark:hover:text-[#87CEEB] cursor-pointer"
                          fill="currentColor"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span className="text-[13px] text-[#7A736C] dark:text-[#9E9893]">
                          {rec.role}
                        </span>
                      </div>
                    </div>
                    <Avatar className="w-[80px] h-[80px] rounded-none -mr-6 -my-4 transition-all duration-700">
                      <AvatarImage src={rec.image} className="object-cover" />
                      <AvatarFallback className="rounded-none bg-[#E5D7C4] dark:bg-[#3A352E] text-[#1A1A1A] dark:text-[#F0EDE7]">
                        {getInitials(rec.name, "A")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="p-0">
                    <div className="border border-dashed border-[#E5D7C4] dark:border-[#3A352E] rounded-[12px] p-4">
                      <p
                        className="text-[#7A736C] dark:text-[#B5AFA5] text-sm md:text-[15px] leading-relaxed"
                        style={{ fontWeight: 450 }}
                      >
                        {rec.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

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
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSidebar?.(sidebars.about)}
                className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
            My Story
          </h2>

          <div className="relative mb-8 h-56 flex items-center justify-center">
            <motion.div
              initial={{ rotate: -8, x: -120, y: 0 }}
              whileHover={{ rotate: -2, scale: 1.1, zIndex: 50 }}
              className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-0"
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
              className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-10"
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
              className="absolute w-32 h-40 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-20"
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
              className="absolute w-36 h-36 rounded-xl overflow-hidden border-4 border-white dark:border-[#2A2520] shadow-lg z-30"
            >
              <img
                src={storyImages[3]}
                alt="Creative studio"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <div className="space-y-6 text-[#7A736C] dark:text-[#B5AFA5] text-base leading-[1.7]">
            {(storyText || "")
              .split("\n")
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
          </div>
        </motion.div>

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
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
              <Sheet
                modal={false}
                open={isStackPanelOpen}
                onOpenChange={setIsStackPanelOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openSidebar?.(sidebars.tools);
                    }}
                    className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-0 flex flex-col"
                  hasOverlay={false}
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <SheetHeader className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex-shrink-0 flex flex-row items-center m-0 space-y-0 h-[65px]">
                    <SheetTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] font-medium m-0">
                      Edit Stack
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] ml-1">
                        Search Tools
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
                        <Input
                          placeholder="Search for a tool..."
                          value={toolSearchQuery}
                          onChange={(e) => setToolSearchQuery(e.target.value)}
                          className="h-10 pl-9 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 transition-all shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {allTools
                          .filter((t) =>
                            t.name
                              .toLowerCase()
                              .includes(toolSearchQuery.toLowerCase()),
                          )
                          .sort((a, b) => {
                            const isASelected = activeTools.some(
                              (t) => t.name === a.name,
                            );
                            const isBSelected = activeTools.some(
                              (t) => t.name === b.name,
                            );
                            if (isASelected === isBSelected)
                              return a.name.localeCompare(b.name);
                            return isASelected ? -1 : 1;
                          })
                          .map((tool) => {
                            const isSelected = activeTools.some(
                              (t) => t.name === tool.name,
                            );
                            return (
                              <motion.button
                                layout
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                                key={`tool-${tool.name}`}
                                onClick={() =>
                                  isSelected
                                    ? handleRemoveTool(tool)
                                    : handleAddTool(tool)
                                }
                                className={`group h-[34px] px-3.5 rounded-xl flex items-center gap-2.5 text-[13px] font-medium transition-colors border ${isSelected
                                    ? "bg-[#EFECE6] dark:bg-[#1A1A1A] border-black/5 dark:border-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] shadow-sm"
                                    : "bg-transparent border-transparent text-[#7A736C] dark:text-[#9E9893] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]"
                                  }`}
                              >
                                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                                  <img
                                    src={tool.icon}
                                    alt={tool.name}
                                    className={`absolute inset-0 w-4 h-4 object-contain transition-all duration-200 ${isSelected
                                        ? "grayscale-0 opacity-100"
                                        : "grayscale opacity-50 group-hover:opacity-0 group-hover:scale-50 group-hover:-rotate-45"
                                      }`}
                                  />
                                  {!isSelected && (
                                    <Plus className="absolute inset-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-50 group-hover:scale-100 rotate-45 group-hover:rotate-0" />
                                  )}
                                </div>
                                {tool.name}
                              </motion.button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-[#2A2520]">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-4 rounded-full text-[13px] font-medium border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Close
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
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
                  {isEditing && (
                    <div className="absolute -top-3 -right-3 z-20 transition-opacity flex gap-1 opacity-100 md:opacity-0 md:group-hover/tool:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-black/10 dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-2.5 h-2.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}
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

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Contact Section (Grid) */}
        <motion.div
          variants={itemVariants}
          className="px-5 md:px-8 py-8 relative group/section"
        >
          {isEditing && (
            <div className="absolute top-4 right-4 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
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
          <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-6">
            Contact
          </h2>
          {(email || phone) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {email && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(email, "email")}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      {copiedField === "email" ? "Copied!" : "Copy mail"}
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: 15 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <AtSignIcon
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
              {phone && (
                <motion.div
                  whileHover="hover"
                  initial="rest"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(phone, "phone")}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                  >
                    <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                      {copiedField === "phone" ? "Copied!" : "Copy phone"}
                    </span>
                    <motion.div
                      variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.3, rotate: -15 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Phone
                        size={14}
                        className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                      />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {(socials.linkedin ||
            portfolios.dribbble ||
            socials.twitter ||
            portfolios.medium) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {socials.linkedin && (
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExternalLink(socials.linkedin)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                    >
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                        Linkedin
                      </span>
                      <motion.div
                        variants={{
                          rest: { scale: 1, rotate: 0 },
                          hover: { scale: 1.3, rotate: -10 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <Linkedin
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
                {portfolios.dribbble && (
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExternalLink(portfolios.dribbble)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                    >
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                        Dribbble
                      </span>
                      <motion.div
                        variants={{
                          rest: { scale: 1, rotate: 0 },
                          hover: { scale: 1.3, rotate: 20 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <DribbbleIcon
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
                {socials.twitter && (
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExternalLink(socials.twitter)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                    >
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                        X
                      </span>
                      <motion.div
                        variants={{
                          rest: { scale: 1, rotate: 0 },
                          hover: { scale: 1.3, rotate: -20 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <TwitterIcon
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
                {portfolios.medium && (
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExternalLink(portfolios.medium)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
                    >
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                        Medium
                      </span>
                      <motion.div
                        variants={{
                          rest: { scale: 1, rotate: 0 },
                          hover: { scale: 1.3, rotate: 15 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <Globe
                          size={14}
                          className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                        />
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

          {resumeUrl && (
            <motion.div whileHover="hover" initial="rest" className="w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalLink(resumeUrl)}
                className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
              >
                <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                  View resume
                </span>
                <motion.div
                  variants={{
                    rest: { scale: 1, rotate: 0 },
                    hover: { scale: 1.3, rotate: -15 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  <FileText
                    size={14}
                    className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                  />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="custom-dashed-t"
        ></motion.div>

        {/* Dino Game Section */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col items-center justify-center overflow-hidden border-b border-[#E5D7C4]/50"
        >
          <div className="absolute top-6 left-8 right-8 flex justify-between z-10 font-dm-mono text-[10px] uppercase tracking-widest text-[#463B34] dark:text-[#C4B5A0] pointer-events-none">
            <span>
              {isGameOver
                ? "Game Over"
                : isPlaying
                  ? "Playing"
                  : "Tap to play"}
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
      </div>
    </div>
  );
};

export default Mono;

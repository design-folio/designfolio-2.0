import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "./switch-button";
import {
  Phone,
  Linkedin,
  Globe,
  FileText,
  Play,
  Square,
  Sun,
  Moon,
  Move,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { AtSignIcon, DribbbleIcon, TwitterIcon } from "lucide-animated";
import { Button } from "../../ui/button";
import { useTheme } from "next-themes";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { _updateUser } from "@/network/post-request";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { modals, sidebars } from "@/lib/constant";
import ProjectLock from "@/components/projectLock";
import { useRouter } from "next/router";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import ClampableTiptapContent from "@/components/ClampableTiptapContent";
import {
  DEFAULT_PEGBOARD_IMAGES,
  DEFAULT_PEGBOARD_STICKERS,
} from "@/lib/aboutConstants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getHref = (id, edit, preview) => {
  if (edit) return `/project/${id}/editor`;
  if (preview) return `/project/${id}/preview`;
  return `/project/${id}`;
};

function getTextFromTiptap(node) {
  if (!node) return "";

  // Text node
  if (node.type === "text") {
    return node.text || "";
  }

  // Hard line break
  if (node.type === "hardBreak") {
    return "\n";
  }

  // If node has children
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextFromTiptap).join("");
  }

  return "";
}

// static assets
// import project1 from "@/assets/images/temp/project1.png";
// import project2 from "@/assets/images/temp/project2.png";
// import story1 from "@/assets/images/temp/story-1.jpg";
// import story2 from "@/assets/images/temp/story-2.jpg";
// import story3 from "@/assets/images/temp/story-3.jpg";

// Creative template specific states
const creativeTestimonials = [
  {
    id: 3,
    name: "Sarah Jenkins",
    title: "VP of Product, Stripe",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    text: "Matt is one of the most talented designers I've had the pleasure of working with. His ability to balance aesthetics with complex functionality is truly impressive. He elevated our entire product experience.",
  },
  {
    id: 4,
    name: "David Chen",
    title: "Engineering Lead, Vercel",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    text: "We brought Matt on for a critical redesign project. Not only did he deliver beautiful visuals, but his systematic approach to our component library completely transformed how our engineering team builds UI.",
  },
];

export default function Canvas({ isEditing, preview = false }) {
  const {
    projectRef,
    userDetails,
    setUserDetails,
    setSelectedProject,
    openModal,
    openSidebar,
    updateCache,
    setSelectedWork,
    setSelectedReview,
  } = useGlobalContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const careerLadderRef = useRef(null);
  const ladderContainerRef = useRef(null);
  const pegboardRef = useRef(null);
  const [zIndexes, setZIndexes] = useState({ 1: 10, 2: 20, 3: 10 });
  const [characterPosition, setCharacterPosition] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isHoveringTestimonial, setIsHoveringTestimonial] = useState(false);
  const [playingTestimonial, setPlayingTestimonial] = useState(null);
  const [isProjectsAddDropdownOpen, setIsProjectsAddDropdownOpen] =
    useState(false);
  const [expandedCards, setExpandedCards] = useState([]);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const toggleExpandReview = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Auto carousel effect
  useEffect(() => {
    if (isHoveringTestimonial) return;

    const timer = setInterval(() => {
      setCurrentTestimonialIndex(
        (prev) => (prev + 1) % creativeTestimonials.length,
      );
    }, 5000); // 5 seconds per testimonial

    return () => clearInterval(timer);
  }, [creativeTestimonials.length, isHoveringTestimonial]);

  useEffect(() => {
    let rafId;

    const updatePosition = () => {
      if (!careerLadderRef.current || !ladderContainerRef.current) return;

      const sectionRect = careerLadderRef.current.getBoundingClientRect();
      const containerHeight = ladderContainerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // When does the section start entering the viewport?
      // When sectionRect.bottom reaches viewportHeight (bottom of viewport)
      // Progress: 0 = section entering from bottom, 1 = section exiting from top

      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;

      let progress = 0;

      // Calculate when the section is in viewport
      // We want progress to be 0 when the section top reaches the middle of the screen
      // and 1 when the section bottom reaches the middle of the screen

      const middleOfScreen = viewportHeight / 2;

      // Calculate how far the top of the section is from the middle of the screen
      // Positive when below middle, negative when above middle
      const distanceFromMiddle = sectionTop - middleOfScreen;

      // We start when top reaches middle (distance = 0)
      // We end when bottom reaches middle (distance = -sectionHeight)

      // Map the distance to a 0-1 progress value
      // 0 = sectionTop is at middleOfScreen
      // 1 = sectionTop is at middleOfScreen - sectionHeight (so section bottom is at middle)
      if (distanceFromMiddle > 0) {
        progress = 0; // Section is below the middle
      } else if (distanceFromMiddle < -sectionHeight) {
        progress = 1; // Section is above the middle
      } else {
        // Section is passing through the middle
        progress = Math.abs(distanceFromMiddle) / sectionHeight;
      }
      progress = Math.max(0, Math.min(1, progress));

      // Get the max available height for character movement
      const maxPosition = containerHeight - 54; // 54px is character height

      // Apply progress to move character across full ladder height
      const newPosition = progress * maxPosition;

      setCharacterPosition(newPosition);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    const timeoutId = setTimeout(updatePosition, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleEnd = () => setPlayingTestimonial(null);
    window.speechSynthesis.addEventListener("voiceschanged", () => {}); // Just to initialize
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const currentDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlayTestimonial = (text, id) => {
    if (playingTestimonial === id) {
      window.speechSynthesis.cancel();
      setPlayingTestimonial(null);
    } else {
      window.speechSynthesis.cancel();
      const textContent = getTextFromTiptap(text);
      console.log("Playing testimonial:", textContent, text);
      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.onend = () => setPlayingTestimonial(null);
      window.speechSynthesis.speak(utterance);
      setPlayingTestimonial(id);
    }
  };

  const {
    bio,
    introduction,
    skills = [],
    hiddenSections,
    projects,
    experiences = [],
    tools = [],
    about,
    reviews,
  } = userDetails || {};

  const aboutObj = userDetails?.about;
  const description = aboutObj?.description || "";
  const images =
    aboutObj?.pegboardImages?.length > 0
      ? aboutObj.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;
  const stickers =
    aboutObj?.pegboardStickers?.length > 0
      ? aboutObj.pegboardStickers
      : DEFAULT_PEGBOARD_STICKERS;
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const sectionId = "works";
  const isSectionHidden = hiddenSections?.includes(sectionId);

  const handleToggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedHiddenSections = isSectionHidden
      ? hiddenSections.filter((id) => id !== sectionId)
      : [...hiddenSections, sectionId];

    // Update locally (no flicker)
    setUserDetails((prev) => ({
      ...prev,
      hiddenSections: updatedHiddenSections,
    }));

    // Update cache without replacing full user
    updateCache("userDetails", (prev) => ({
      ...prev,
      hiddenSections: updatedHiddenSections,
    }));

    // Fire and forget backend update
    _updateUser({ hiddenSections: updatedHiddenSections });
  };

  // Filter out hidden projects in preview mode
  const visibleProjects = React.useMemo(() => {
    if (preview && projects) {
      return projects.filter((project) => !project.hidden);
    }
    return projects || [];
  }, [projects, preview]);

  const handleNavigation = (route) => {
    router.push(route);
  };

  const onDeleteProject = (project) => {
    openModal(modals.deleteProject);
    setSelectedProject(project);
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id)
        ? prev.filter((cardId) => cardId !== id)
        : [...prev, id],
    );
  };
  const repeatedTools = Array(12).fill(tools).flat();

  const bringToFront = (id) => {
    setZIndexes((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [id]: maxZ + 1 };
    });
  };

  const playPegboardClick = (type) => {
    try {
      const audioContext =
        new window.AudioContext() || window.webkitAudioContext();
      const now = audioContext.currentTime;

      if (type === "grab") {
        // Quick peek sound when grabbing
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.start(now);
        osc.stop(now + 0.03);
      } else {
        // Quick pop sound when dropping
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (e) {
      // Audio context not available or blocked
    }
  };
  const review = reviews[currentTestimonialIndex];
  // console.log(about, userDetails);

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pb-20 pt-0 px-4 md:px-0 max-w-[640px] mx-auto">
      {/* Header / Date */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0 }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 px-4 flex justify-between items-center w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
            {currentDate}
          </span>
          <div className="w-2 h-2 bg-[#E37941] rotate-45"></div>
          <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            value={isDark}
            onToggle={toggleTheme}
            iconOn={<Moon className="size-4" />}
            iconOff={<Sun className="size-4" />}
          />
        </div>
      </motion.div>

      {/* Intro Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 0.15,
        }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-4 flex flex-col md:flex-row gap-6 items-start md:items-center w-full relative group"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openModal("onboarding")}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          </div>
        )}
        <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-sm bg-[#A1C2D8]">
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] tracking-tight leading-tight">
            {introduction}
          </h1>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed max-w-[480px]">
            {bio}
          </p>
        </div>
      </motion.div>

      {/* Marquee Tags */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 overflow-hidden relative w-full"
      >
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
        <motion.div
          className="flex gap-4 whitespace-nowrap"
          animate={{ x: [0, "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
        >
          {[...skills, ...skills, ...skills, ...skills, ...skills].map(
            (skill, index) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                  {skill.label}
                </span>
                <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                  </svg>
                </div>
              </div>
            ),
          )}
        </motion.div>
      </motion.div>

      {/* Projects Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 0.45,
        }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-4 w-full relative group/section"
      >
        {isEditing && (
          <div
            className={`absolute -top-3 -right-3 transition-opacity z-10 flex gap-2
            ${
              isProjectsAddDropdownOpen
                ? "opacity-100"
                : "opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
            }`}
          >
            <DropdownMenu
              open={isProjectsAddDropdownOpen}
              onOpenChange={setIsProjectsAddDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white dark:bg-[#2A2520] border border-black/10 dark:border-white/10 shadow-lg rounded-xl overflow-hidden p-1"
              >
                <DropdownMenuItem
                  onClick={() => openModal(modals.project)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer rounded-lg focus:bg-black/5 dark:focus:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Write from Scratch</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openModal(modals.aiProject)}
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleVisibility}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              {isSectionHidden ? (
                <EyeOff className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              )}
            </Button>
          </div>
        )}
        <h2
          className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-3"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          PROJECTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleProjects?.length === 0 ? (
            <div className="flex flex-col items-center justify-center md:col-span-2 py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                    onClick={() => openModal(modals.project)}
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
              {visibleProjects?.map((project) => {
                return (
                  <div
                    className="flex flex-col gap-4 group/card cursor-pointer relative"
                    onClick={() =>
                      handleNavigation(getHref(project._id, true, false))
                    }
                  >
                    {isEditing && (
                      <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(getHref(project._id, true, false));
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                        </Button>
                      </div>
                    )}
                    <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-black/5 dark:border-white/10 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                      <img
                        src={project?.thumbnail?.url}
                        alt={project?.title || "project image"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2 leading-snug line-clamp-2">
                        {project?.title}
                      </h3>
                      <p className="text-[#7A736C] dark:text-[#B5AFA5] text-sm leading-relaxed line-clamp-2">
                        {project?.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isEditing &&
                !(userDetails?.pro || visibleProjects.length < 2) && (
                  <div className={"md:col-span-2"}>
                    <ProjectLock />
                  </div>
                )}
            </>
          )}

          {/* Project Lock */}
        </div>
      </motion.div>

      {/* Experience / Career Ladder Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.6 }}
        ref={careerLadderRef}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-4 md:p-6 w-full mt-2 relative group/section"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar(sidebars.work)}
              className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Add Experience
              </span>
            </Button>
          </div>
        )}
        <h2
          className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          CAREER LADDER
        </h2>

        <div ref={ladderContainerRef} className="relative flex">
          {/* Character climbing ladder */}
          <div
            className="absolute left-[1px] z-20 w-[40px] h-[54px]"
            style={{ top: `${characterPosition}px`, willChange: "transform" }}
          >
            <img
              src="/assets/svgs/character-me.svg"
              alt="Character climbing"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Timeline Line */}
          <div className="absolute left-0 top-3 bottom-0 w-[42px] flex flex-col justify-between items-start border-x-[5px] border-[#F0EDE7] dark:border-[#3A352E] py-1 bg-transparent">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="w-full h-[5px] bg-[#F0EDE7] dark:bg-[#3A352E]"
              ></div>
            ))}
          </div>

          <div className="space-y-12 pl-16 relative z-10 w-full pt-1 pb-2">
            {experiences.map((experience) => {
              const {
                role,
                company,
                startMonth,
                startYear,
                endMonth,
                endYear,
                currentlyWorking,
                description,
                _id,
              } = experience;
              const hasDescription =
                description && getPlainTextLength(description || "") > 0;
              return (
                <div
                  key={_id}
                  className="relative group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-colors"
                >
                  {isEditing && (
                    <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          setSelectedWork(experience);
                          openSidebar(sidebars.work);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                      {role} @ {company}
                    </h3>
                    <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
                      {`${startMonth} ${startYear}  — ${
                        currentlyWorking ? "Present" : `${endMonth} ${endYear}`
                      }`}
                    </div>
                  </div>
                  {hasDescription && (
                    <div className="text-sm text-foreground-landing/60 leading-relaxed max-w-xl">
                      <ClampableTiptapContent
                        content={description || ""}
                        mode="work"
                        enableBulletList={true}
                        maxLines={3}
                        itemId={_id}
                        expandedIds={expandedCards}
                        onToggleExpand={toggleExpand}
                        buttonClassName="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed mb-4"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tools Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 0.75,
        }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 py-2 w-full relative group/section"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal?.(modals.tools)}
              className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Add Tool
              </span>
            </Button>
          </div>
        )}
        <div className="overflow-hidden relative w-full rounded-[32px]">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>

          <motion.div
            className="flex gap-8 py-1 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {repeatedTools.map((tool, i) => (
              <img
                key={i}
                src={tool.image}
                alt={tool.label}
                className="flex-shrink-0 w-9 h-9 hover:scale-110 transition-transform cursor-pointer"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* About Me Section with Pegboard */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.9 }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar?.(sidebars.about)}
              className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Edit Story
              </span>
            </Button>
          </div>
        )}
        <h2
          className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          MY STORY
        </h2>

        {/* Pegboard Grid Background */}
        <div className="relative w-full mb-8 rounded-[32px] border border-black/5 dark:border-white/10 bg-[#F7F4EF] dark:bg-[#1E1B18]">
          {/* Invisible larger boundary for drag constraints allowing slight overflow */}
          <div
            className="absolute -inset-6 md:-inset-10 pointer-events-none"
            ref={pegboardRef}
          ></div>

          {/* Light Mode Grid */}
          <div
            className="absolute inset-0 dark:hidden pointer-events-none rounded-[32px] overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              backgroundPosition: "center center",
            }}
          ></div>
          {/* Dark Mode Grid */}
          <div
            className="absolute inset-0 hidden dark:block pointer-events-none rounded-[32px] overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              backgroundPosition: "center center",
            }}
          ></div>

          <div className="relative h-[260px] md:h-[320px] flex flex-row items-center justify-center px-2 md:p-4 gap-4 md:gap-10">
            {images.map((img, index) => (
              <motion.div
                key={img._id || index}
                drag
                dragConstraints={pegboardRef}
                dragMomentum={false}
                dragElastic={0}
                onDragStart={() => {
                  bringToFront(index);
                  playPegboardClick("grab");
                }}
                onDragEnd={() => playPegboardClick("drop")}
                onPointerDown={() => bringToFront(index)}
                whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                initial={{ y: index % 2 === 0 ? 10 : -10 }}
                style={{ zIndex: zIndexes[index] }}
                className={`relative ${
                  index === 1
                    ? "w-32 md:w-44 aspect-square"
                    : "w-28 md:w-36 aspect-[3/4]"
                } group cursor-grab`}
              >
                <div
                  className="w-full h-full pointer-events-none relative"
                  style={{
                    transform: `rotate(${index % 2 === 0 ? "-4deg" : "6deg"})`,
                  }}
                >
                  <div className="w-full h-full bg-white dark:bg-[#2A2520] p-2 rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 relative group-hover:shadow-md transition-shadow">
                    <img
                      src={img.src || img.key}
                      alt={`pegboard-${index}`}
                      className="w-full h-full object-cover rounded-[8px]"
                      draggable="false"
                    />
                  </div>

                  {/* Tape */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#DFCDAA]/90 dark:bg-[#9B8C73]/90 backdrop-blur-sm shadow-sm z-20"
                    style={{ transform: "rotate(-3deg)" }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story Text */}
        <div className="space-y-4">
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed">
            {about?.description?.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 0.95,
        }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar?.(sidebars.review)}
              className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Add Testimonial
              </span>
            </Button>
          </div>
        )}
        <h2
          className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          TESTIMONIALS
        </h2>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <>sdasd</>
          ) : (
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonialIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onMouseEnter={() => setIsHoveringTestimonial(true)}
                  onMouseLeave={() => setIsHoveringTestimonial(false)}
                  className="group border border-[#E5D7C4] dark:border-white/10 p-6 rounded-2xl bg-white/50 dark:bg-[#2A2520]/50 hover:bg-white dark:hover:bg-[#35302A] transition-colors relative"
                >
                  {isEditing && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReview(review);
                          openSidebar(sidebars.review);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReview(review);
                          openSidebar(sidebars.review);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}

                  <ClampableTiptapContent
                    content={review?.description || ""}
                    mode="review"
                    enableBulletList={false}
                    maxLines={3}
                    itemId={review?._id ?? `${idx}`}
                    expandedIds={expandedReviewIds}
                    onToggleExpand={toggleExpandReview}
                    className="font-inter text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed mb-6 italic"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 shrink-0 rounded-xl">
                        <AvatarImage
                          src={review?.avatar?.url || review?.avatar}
                          alt={review?.name}
                        />
                        <AvatarFallback
                          className="rounded-none"
                          style={{
                            backgroundColor: "#FF9966",
                            color: "#FFFFFF",
                          }}
                        >
                          {review?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="font-medium text-[14px]">
                          {review.name}
                        </h4>
                        <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
                          {review.company}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePlayTestimonial(
                          reviews[currentTestimonialIndex].description,
                          reviews[currentTestimonialIndex]._id,
                        )
                      }
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#2A2520] border border-[#E5D7C4] dark:border-white/10 rounded-full text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors shadow-sm"
                    >
                      {playingTestimonial ===
                      creativeTestimonials[currentTestimonialIndex].id ? (
                        <>
                          <Square size={14} className="fill-current" />
                          <div className="flex items-center justify-center gap-[2px] h-[14px] w-[30px]">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-[2px] bg-current rounded-full"
                                animate={{ height: ["4px", "12px", "4px"] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Play size={14} className="fill-current" />
                          <span className="text-[12px] font-medium w-[30px] text-center">
                            Play
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-4 pt-2">
            {creativeTestimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTestimonialIndex(idx);
                  // Temporarily pause auto-scroll when manually clicked
                  setIsHoveringTestimonial(true);
                  setTimeout(() => setIsHoveringTestimonial(false), 5000);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentTestimonialIndex
                    ? "w-6 bg-[#1A1A1A] dark:bg-[#F0EDE7]"
                    : "w-1.5 bg-[#E5D7C4] dark:bg-white/20 hover:bg-[#D5D0C6] dark:hover:bg-white/40"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
          delay: 1.05,
        }}
        className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
      >
        {isEditing && (
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Edit Contact
              </span>
            </Button>
          </div>
        )}
        <h2
          className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          CONTACT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
            >
              <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                Copy mail
              </span>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.3, rotate: 15 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <AtSignIcon
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-[#2A2520] rounded-xl border border-black/5 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors group h-auto"
            >
              <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
                Copy phone
              </span>
              <motion.div
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.3, rotate: -15 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <Phone
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
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
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <Linkedin
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
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
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <DribbbleIcon
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
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
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <TwitterIcon
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div
            whileHover="hover"
            initial="rest"
            className="w-full relative group/link"
          >
            {isEditing && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
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
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={
                  isEditing
                    ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                    : ""
                }
              >
                <Globe
                  size={14}
                  className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
                />
              </motion.div>
            </Button>
          </motion.div>
        </div>
        <motion.div
          whileHover="hover"
          initial="rest"
          className="w-full relative group/link"
        >
          {isEditing && (
            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/link:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
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
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={
                isEditing
                  ? "opacity-0 md:group-hover/link:opacity-0 transition-opacity"
                  : ""
              }
            >
              <FileText
                size={14}
                className="text-[#7A736C] dark:text-[#9E9893] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7]"
              />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { AtSignIcon, DribbbleIcon, TwitterIcon } from "lucide-animated";
import { Button } from "../../ui/button";
import { useTheme } from "next-themes";

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

export default function Canvas({ isEditing }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const careerLadderRef = useRef(null);
  const ladderContainerRef = useRef(null);
  const pegboardRef = useRef(null);
  const [zIndexes, setZIndexes] = useState({ 1: 10, 2: 20, 3: 10 });
  const [characterPosition, setCharacterPosition] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isHoveringTestimonial, setIsHoveringTestimonial] = useState(false);
  const [playingTestimonial, setPlayingTestimonial] = useState(null);
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
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
            Mon, Mar 9
          </span>
          <div className="w-2 h-2 bg-[#E37941] rotate-45"></div>
          <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
            {currentTime.toLocaleTimeString([], {
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
              className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          </div>
        )}
        <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-sm bg-[#A1C2D8]">
          <img
            src={"asd"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] tracking-tight leading-tight">
            Hey I'm Matt.
          </h1>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed max-w-[480px]">
            I'm a Design Engineer focused on crafting meaningful digital
            experiences where design meets code.
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
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                Interaction Design
              </span>
              <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                </svg>
              </div>
              <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                3D Design
              </span>
              <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                </svg>
              </div>
              <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                User Research
              </span>
              <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                </svg>
              </div>
              <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                UI/UX Design
              </span>
              <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                </svg>
              </div>
            </div>
          ))}
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
          <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
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
          {/* Project 1 */}
          <div
            className="flex flex-col gap-4 group/card cursor-pointer relative"
            onClick={() => handleProjectClick("slate")}
          >
            {isEditing && (
              <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
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
            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-black/5 dark:border-white/10 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              <img
                src={"project1"}
                alt="Project 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2 leading-snug line-clamp-2">
                Redesigning Quote Builder at Freshworks for 1,900+ Enterprise
                U...
              </h3>
              <p className="text-[#7A736C] dark:text-[#B5AFA5] text-sm leading-relaxed line-clamp-2">
                A sleek and responsive landing page designed for modern startups
                to showca...
              </p>
            </div>
          </div>

          {/* Project 2 */}
          <div
            className="flex flex-col gap-4 group/card cursor-pointer relative"
            onClick={() => handleProjectClick("antimetal")}
          >
            {isEditing && (
              <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
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
            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-black/5 dark:border-white/10 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              <img
                src={"project2"}
                alt="Project 2"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2 leading-snug line-clamp-2">
                Designfolio: No-Code Portfolio Builder for 9,000+ Users
              </h3>
              <p className="text-[#7A736C] dark:text-[#B5AFA5] text-sm leading-relaxed line-clamp-2">
                Helping Product folks build bragworthy portfolio websites.
              </p>
            </div>
          </div>
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
              src="/character-me.svg"
              alt="Character climbing"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Timeline Line */}
          <div className="absolute left-0 top-3 bottom-0 w-[42px] flex flex-col justify-between items-start border-x-[5px] border-[#F0EDE7] dark:border-[#3A352E] py-1 bg-transparent">
            {[...Array(38)].map((_, i) => (
              <div
                key={i}
                className="w-full h-[5px] bg-[#F0EDE7] dark:bg-[#3A352E]"
              ></div>
            ))}
          </div>

          <div className="space-y-12 pl-16 relative z-10 w-full pt-1 pb-2">
            {/* Experience 1 */}
            <div className="relative group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-colors">
              {isEditing && (
                <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
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
                  Product Designer @ Sense Hq
                </h3>
                <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
                  2025 — Present
                </div>
              </div>
              <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed mb-4">
                Currently designing AI-powered recruiter tools that help HR
                teams create conversational talent workflows and automate
                engagement.
              </p>
              <ul className="space-y-2.5 text-[#7A736C] dark:text-[#B5AFA5] text-[15px]">
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>AI agents for recruiters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>Simplifying complex AI workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>
                    Scaling interaction patterns for enterprise hiring tools
                  </span>
                </li>
              </ul>
            </div>

            {/* Experience 2 */}
            <div className="relative group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-colors">
              {isEditing && (
                <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
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
                  Product Designer @ Sense Hq
                </h3>
                <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
                  2025 — Present
                </div>
              </div>
              <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed mb-4">
                Currently designing AI-powered recruiter tools that help HR
                teams create conversational talent workflows and automate
                engagement.
              </p>
              <div className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] mb-3">
                Focus areas:
              </div>
              <ul className="space-y-2.5 text-[#7A736C] dark:text-[#B5AFA5] text-[15px]">
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>AI agents for recruiters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>Simplifying complex AI workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>
                    Scaling interaction patterns for enterprise hiring tools
                  </span>
                </li>
              </ul>
            </div>

            {/* Experience 3 */}
            <div className="relative group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-colors">
              {isEditing && (
                <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
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
                  Product Designer @ Sense Hq
                </h3>
                <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
                  2025 — Present
                </div>
              </div>
              <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed mb-4">
                Currently designing AI-powered recruiter tools that help HR
                teams create conversational talent workflows and automate
                engagement.
              </p>
              <div className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] mb-3">
                Focus areas:
              </div>
              <ul className="space-y-2.5 text-[#7A736C] dark:text-[#B5AFA5] text-[15px]">
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>AI agents for recruiters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>Simplifying complex AI workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#7A736C] dark:bg-[#B5AFA5] shrink-0"></span>
                  <span>
                    Scaling interaction patterns for enterprise hiring tools
                  </span>
                </li>
              </ul>
            </div>
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
            className="flex gap-8 py-1"
            animate={{ x: [0, "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[
              { name: "Figma", image: "/tools/image 4.png" },
              { name: "Notion", image: "/tools/image 5.png" },
              { name: "Procreate", image: "/tools/image 6.png" },
              { name: "Plasticity", image: "/tools/image 7.png" },
              { name: "Reeder", image: "/tools/image 8.png" },
              { name: "Anthropic", image: "/tools/image 9.png" },
              { name: "Sketch", image: "/tools/image 10.png" },
              { name: "Figma", image: "/tools/image 4.png" },
              { name: "Notion", image: "/tools/image 5.png" },
              { name: "Procreate", image: "/tools/image 6.png" },
              { name: "Plasticity", image: "/tools/image 7.png" },
              { name: "Reeder", image: "/tools/image 8.png" },
              { name: "Anthropic", image: "/tools/image 9.png" },
            ].map((tool, i) => (
              <img
                key={i}
                src={tool.image}
                alt={tool.name}
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
            {/* Image 1 - Left with L-shape tape (Portrait) */}
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(1);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(1)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: 10 }}
              style={{ zIndex: zIndexes[1] }}
              className="relative w-28 md:w-36 aspect-[3/4] group cursor-grab"
            >
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
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
              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[12px] md:rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-md transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={"story1"}
                      alt="My workspace"
                      className="w-full h-full object-cover rounded-[6px] md:rounded-[8px]"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-[6px] md:rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-sm scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Move className="w-4 h-4 md:w-5 md:h-5 text-gray-800 dark:text-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Top tape part */}
                <div
                  className="absolute -top-1 -left-2 w-12 md:w-16 h-5 md:h-6 bg-[#E8CF82]/90 dark:bg-[#B89B4D]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(-2deg)" }}
                ></div>
                {/* Side tape part */}
                <div
                  className="absolute top-3 md:top-4 -left-2 md:-left-3 w-5 md:w-6 h-10 md:h-12 bg-[#E8CF82]/90 dark:bg-[#B89B4D]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(2deg)" }}
                ></div>
              </div>
            </motion.div>

            {/* Image 2 - Center with Top Tape and Figma Logo (Squircle) */}
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(2);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(2)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: 15 }}
              style={{ zIndex: zIndexes[2] }}
              className="relative w-32 md:w-44 aspect-square group cursor-grab"
            >
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
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
              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(6deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[24px] md:rounded-[32px] shadow-md border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={"story2"}
                      alt="Designing"
                      className="w-full h-full object-cover rounded-[16px] md:rounded-[24px]"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-[16px] md:rounded-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-sm scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Move className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Center tape */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-5 md:h-6 bg-[#DFCDAA]/90 dark:bg-[#9B8C73]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(-3deg)" }}
                ></div>

                {/* Figma Logo Accent */}
                <div
                  className="absolute -bottom-3 md:-bottom-5 -right-3 md:-right-5 w-12 md:w-16 h-12 md:h-16 z-30"
                  style={{ transform: "rotate(-10deg)" }}
                >
                  <img
                    src="/stickerfigma.png"
                    alt="Figma Sticker"
                    className="w-full h-full object-contain drop-shadow-md"
                    draggable="false"
                  />
                </div>
              </div>
            </motion.div>

            {/* Image 3 - Right with Long Top Tape (Portrait) */}
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(3);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(3)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: -10 }}
              style={{ zIndex: zIndexes[3] }}
              className="relative w-28 md:w-36 aspect-[3/4] group cursor-grab"
            >
              {isEditing && (
                <div className="absolute -top-2 -right-2 z-40 transition-opacity flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
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
              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[12px] md:rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-md transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={"story3"}
                      alt="Coffee and notes"
                      className="w-full h-full object-cover rounded-[6px] md:rounded-[8px]"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-[6px] md:rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-sm scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Move className="w-4 h-4 md:w-5 md:h-5 text-gray-800 dark:text-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Long horizontal tape */}
                <div
                  className="absolute -top-3 md:-top-4 -left-2 md:-left-4 w-32 md:w-44 h-5 md:h-6 bg-[#D3C4A9]/90 dark:bg-[#8D826B]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(1deg)" }}
                ></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Story Text */}
        <div className="space-y-4">
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed">
            I'm Matt Chen, a passionate Design Engineer focused on crafting
            meaningful digital experiences where design meets code. Currently
            exploring new ways to create intuitive interfaces that users love,
            I'm driven by curiosity and a deep appreciation for thoughtful,
            purposeful design.
          </p>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed">
            I thrive on transforming complex ideas into reality — whether it's
            designing seamless user experiences, building interactive
            prototypes, creating distinctive brand experiences, or developing
            websites that feel effortless to use.
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
                  <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
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
                <p className="font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed mb-6 italic relative z-10">
                  "{creativeTestimonials[currentTestimonialIndex].text}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E5D7C4] dark:bg-white/10 overflow-hidden shrink-0">
                      <img
                        src={
                          creativeTestimonials[currentTestimonialIndex].image
                        }
                        alt={creativeTestimonials[currentTestimonialIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px]">
                        {creativeTestimonials[currentTestimonialIndex].name}
                      </h4>
                      <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                        {creativeTestimonials[currentTestimonialIndex].title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handlePlayTestimonial(
                        creativeTestimonials[currentTestimonialIndex].text,
                        creativeTestimonials[currentTestimonialIndex].id,
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

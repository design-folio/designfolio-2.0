import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Copy,
  Pencil,
  Plus,
  Trash2,
  X,
  ArrowUp,
  FileText,
  Linkedin,
  Twitter,
  Dribbble,
  Globe,
  Check,
  Instagram,
  Phone,
} from "lucide-react";

import { motion, AnimatePresence, Reorder, Variants } from "framer-motion";
import { format } from "date-fns";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { modals, sidebars } from "@/lib/constant";
import { useRouter } from "next/router";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";
import ClampableTiptapContent from "@/components/ClampableTiptapContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPlainTextLength, tiptapToDisplayString } from "@/lib/tiptapUtils";

export default function Chat({ isEditing = false, preview = false }) {
  const {
    userDetails,
    setUserDetails,
    openModal,
    openSidebar,
    setSelectedProject,
    setSelectedWork,
    setSelectedReview,
    updateCache,
  } = useGlobalContext();
  const router = useRouter();

  const {
    introduction,
    bio,
    about,
    experiences = [],
    reviews = [],
    skills = [],
    tools = [],
    projects = [],
    socials = {},
    portfolios = {},
    resume,
    phone,
    hiddenSections,
  } = userDetails || {};

  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );
  const email = userDetails?.contact_email || userDetails?.email;

  const aboutImages =
    about?.pegboardImages?.length > 0
      ? about.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;

  const aboutDescription = about?.description;
  const hasAboutDescription =
    aboutDescription && getPlainTextLength(aboutDescription || "") > 0;

  const visibleProjects = useMemo(
    () => (projects || []).filter((p) => !p.hidden),
    [projects],
  );

  const [copiedField, setCopiedField] = useState(null);
  const handleCopy = useCallback((value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const [chatRevealStep, setChatRevealStep] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStoryImage, setSelectedStoryImage] = useState(null);
  const [expandedExpCards, setExpandedExpCards] = useState([]);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const toggleExpandExp = useCallback((id) => {
    setExpandedExpCards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleExpandReview = useCallback((id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const getProjectHref = useCallback(
    (id) => (isEditing ? `/project/${id}/editor` : `/project/${id}`),
    [isEditing],
  );

  // When preview=true & editing=false: hide editing UI, hide empty sections
  // When preview=false & editing=true: existing editing behavior
  const canEdit = isEditing && !preview;
  const hasCustomAboutImages = about?.pegboardImages?.length > 0;
  const hasAboutContent = hasAboutDescription || hasCustomAboutImages;

  useEffect(() => {
    setChatRevealStep(0);

    // Build reveal sequence, skipping steps for hidden sections in preview mode
    const stepsToReveal = [];
    for (let step = 1; step <= 21; step++) {
      if (preview) {
        // Message 2 - "You" skills/tools prompt
        if (step === 4 && skills.length === 0 && tools.length === 0) continue;
        // Message 3 - Skills
        if (step === 5 && skills.length === 0) continue;
        // Message 4 - Tools
        if (step === 6 && tools.length === 0) continue;
        // Message 5/6/7 - Work prompt & project cards
        if (
          (step === 7 || step === 8 || step === 9) &&
          visibleProjects.length === 0
        )
          continue;
        // Message 8/9/10 - Experience prompt, typing & details
        if (
          (step === 10 || step === 11 || step === 12) &&
          experiences.length === 0
        )
          continue;
        // Message 11/12/13 - Testimonials prompt, intro & cards
        if ((step === 13 || step === 14 || step === 15) && reviews.length === 0)
          continue;
        // Message 14/15/16 - Story prompt, images & text
        if ((step === 16 || step === 17 || step === 18) && !hasAboutContent)
          continue;
        // Message 17/18 - Contact prompt & options
        if ((step === 19 || step === 20) && !email && !phone) continue;
      }
      stepsToReveal.push(step);
    }

    const timers = stepsToReveal.map((step, index) =>
      setTimeout(() => setChatRevealStep(step), 500 + index * 1000),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`w-full flex flex-col gap-3 pb-20 ${preview ? "pt-20" : "pt-0"} px-4 md:px-0 max-w-[640px] mx-auto`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={{
          opacity: chatRevealStep >= 1 ? 1 : 0,
          y: chatRevealStep >= 1 ? 0 : 10,
          filter: chatRevealStep >= 1 ? "blur(0px)" : "blur(10px)",
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center space-y-4 pt-2"
      >
        <div className="relative group/avatar cursor-pointer">
          {canEdit && (
            <div className="absolute -inset-2 z-40 transition-opacity flex items-center justify-center opacity-0 group-hover/avatar:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal("onboarding");
                }}
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 relative transition-transform duration-300 group-hover/avatar:scale-105">
            <img
              src={avatarSrc}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-2 relative group/text">
          {canEdit && (
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity opacity-0 group-hover/text:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal("onboarding");
                }}
              >
                <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
            {introduction || "Hey, I'm here."}
          </h1>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed max-w-md">
            {bio || ""}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: chatRevealStep >= 1 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative py-4 flex items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-black/10 dark:border-white/10"></div>
        </div>
        <span className="relative bg-[#EFECE6] dark:bg-[#1A1A1A] px-4 text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5] transition-colors duration-700">
          {format(currentTime, "d EEE, h:mm:ss a")}
        </span>
      </motion.div>

      <div className="space-y-6 pb-6">
        {/* Message 1 */}
        <AnimatePresence mode="popLayout">
          {chatRevealStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              {canEdit && chatRevealStep >= 3 && (
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("onboarding");
                    }}
                  >
                    <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto border border-black/5 dark:border-white/5">
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                  {userDetails?.firstName || "Me"}
                </span>
                <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                  {chatRevealStep === 2 ? (
                    <div className="flex space-x-1.5 items-center px-1">
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  ) : (
                    introduction || "Hey! How can I help?"
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message 2 (You) */}
        <AnimatePresence mode="popLayout">
          {chatRevealStep >= 4 &&
            !(preview && skills.length === 0 && tools.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-end relative group/msg"
              >
                {canEdit && (
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
                <div className="flex flex-col gap-1 max-w-[85%] items-end">
                  <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                    You
                  </span>
                  <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                    Can I see your work?
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Message 3 */}
        <AnimatePresence mode="popLayout">
          {chatRevealStep >= 5 && !(preview && skills.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              {canEdit && chatRevealStep >= 6 && (
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
              <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                {chatRevealStep < 6 && (
                  <motion.div
                    layoutId="matt-avatar-sequence"
                    className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                  >
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </div>
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                {chatRevealStep === 5 ? (
                  <div className="flex space-x-1.5 items-center px-1">
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                ) : skills.length > 0 ? (
                  `My skills are ${skills.map((s) => s.label).join(", ")}`
                ) : (
                  "I have a range of skills to offer"
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message 4 - Tools */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 6 && !(preview && tools.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= 7 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar(sidebars.tools);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              {chatRevealStep < 7 && (
                <motion.div
                  layoutId="matt-avatar-sequence"
                  className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
            <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5">
              {tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] mb-3">
                    No tools added yet.
                  </p>
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.tools)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Tools
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] mb-3">
                    This is my toolbox:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool, i) => (
                      <div
                        key={tool._id || i}
                        className="w-10 h-10 rounded-2xl bg-[#E5E2DB] dark:bg-[#35302A] shadow-sm flex items-center justify-center border border-black/5 dark:border-white/5 relative group/tool"
                      >
                        <img
                          src={tool.image}
                          className="w-6 h-6 object-contain"
                          alt={tool.label || "tool"}
                        />
                      </div>
                    ))}
                    {canEdit && (
                      <button
                        onClick={() => openSidebar(sidebars.tools)}
                        className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-[#35302A]/50 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Plus className="w-5 h-5 text-[#7A736C] dark:text-[#9E9893]" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 5 - Recent work prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 7 && !(preview && visibleProjects.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= 8 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              {chatRevealStep < 8 && (
                <motion.div
                  layoutId="matt-avatar-sequence"
                  className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
            <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
              {chatRevealStep === 7 ? (
                <div className="flex space-x-1.5 items-center px-1">
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.4,
                    }}
                  />
                </div>
              ) : (
                "And here's some recent work"
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 6+ - Projects (dynamic) */}
      {visibleProjects.map((project, index) => (
        <AnimatePresence mode="popLayout" key={project._id}>
          {chatRevealStep >= 8 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
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
                  chatRevealStep < 11 && (
                    <motion.div
                      layoutId="matt-avatar-sequence"
                      className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                    >
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
              </div>
              <div
                onClick={() => router.push(getProjectHref(project._id))}
                className="bg-[#E5E2DB] dark:bg-[#2A2520] p-3 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full cursor-pointer hover:shadow-md hover:scale-[1.01] transform group/proj"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 relative bg-[#D5D0C6] dark:bg-[#1A1A1A]">
                  <img
                    src={project?.thumbnail?.url}
                    alt={project?.title || "project"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px] mb-1 px-1 line-clamp-2">
                  {project?.title}
                </h3>
                <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[14px] leading-relaxed px-1 line-clamp-2">
                  {project?.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Projects empty state */}
      {visibleProjects.length === 0 && chatRevealStep >= 8 && !preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 max-w-[85%]"
        >
          <div className="w-8 h-8 shrink-0" />
          <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-[#E5E2DB]/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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

      {/* Message 8 - You: Experience Prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 10 && !(preview && experiences.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
            <div className="flex flex-col gap-1 max-w-[85%] items-end">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                You
              </span>
              <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                Tell me about your work experience?
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 9 - Experience Details */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 11 && !(preview && experiences.length === 0) && (
          <>
            {experiences.length > 0 ? (
              <motion.div
                key="experience-details"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 max-w-[85%] relative group/msg"
              >
                {canEdit && chatRevealStep >= 12 && (
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSidebar(sidebars.work);
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
                <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                  <motion.div
                    layoutId="matt-avatar-sequence"
                    className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                  >
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
                <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
                  {chatRevealStep === 11 ? (
                    <div className="flex space-x-1.5 items-center px-1 min-h-[22px]">
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] mb-3">
                        Here's a quick overview of my experience:
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                        {experiences.map((exp, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="relative group/exp border-b border-black/5 dark:border-white/5 last:border-0"
                          >
                            {canEdit && (
                              <div className="absolute -left-10 top-2 z-40 opacity-0 group-hover/exp:opacity-100 transition-opacity">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWork(exp);
                                    openSidebar(sidebars.work);
                                  }}
                                >
                                  <Pencil className="w-2.5 h-2.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                                </Button>
                              </div>
                            )}
                            <AccordionTrigger className="hover:no-underline py-3 px-1">
                              <div className="flex flex-col w-full pr-4 text-left">
                                <div className="flex justify-between items-baseline w-full">
                                  <h4 className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px]">
                                    {exp.role}
                                  </h4>
                                  <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                                    {`${exp.startMonth || ""} ${exp.startYear || ""}`}
                                  </span>
                                </div>
                                <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[14px] mt-0.5">
                                  {exp.company}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 px-1">
                              {(() => {
                                // Walk TipTap content tree → flat array of { text, marks, blockType, isFirst }
                                const segments = [];
                                const walkContent = (
                                  node,
                                  inheritedMarks = [],
                                ) => {
                                  if (!node) return;
                                  if (node.type === "text" && node.text) {
                                    segments.push({
                                      text: node.text,
                                      marks: [
                                        ...inheritedMarks,
                                        ...(node.marks || []),
                                      ],
                                    });
                                    return;
                                  }
                                  if (
                                    node.type === "bulletList" &&
                                    node.content
                                  ) {
                                    node.content.forEach((li) => {
                                      segments.push({
                                        text: "• ",
                                        marks: [],
                                        blockType: "bullet",
                                      });
                                      (li.content || []).forEach((child) =>
                                        walkContent(child, inheritedMarks),
                                      );
                                      segments.push({
                                        text: "\n",
                                        marks: [],
                                        blockType: "break",
                                      });
                                    });
                                    return;
                                  }
                                  if (
                                    node.type === "orderedList" &&
                                    node.content
                                  ) {
                                    node.content.forEach((li, i) => {
                                      segments.push({
                                        text: `${i + 1}. `,
                                        marks: [],
                                        blockType: "bullet",
                                      });
                                      (li.content || []).forEach((child) =>
                                        walkContent(child, inheritedMarks),
                                      );
                                      segments.push({
                                        text: "\n",
                                        marks: [],
                                        blockType: "break",
                                      });
                                    });
                                    return;
                                  }
                                  if (
                                    node.content &&
                                    Array.isArray(node.content)
                                  ) {
                                    node.content.forEach((child) =>
                                      walkContent(child, inheritedMarks),
                                    );
                                    const blockTypes = [
                                      "paragraph",
                                      "heading",
                                      "blockquote",
                                    ];
                                    if (blockTypes.includes(node.type)) {
                                      segments.push({
                                        text: "\n",
                                        marks: [],
                                        blockType: "break",
                                      });
                                    }
                                  }
                                };

                                const desc = exp.description;
                                if (!desc) return null;

                                if (typeof desc === "string") {
                                  // HTML string or plain text
                                  const plain = tiptapToDisplayString(desc);
                                  if (!plain) return null;
                                  segments.push({ text: plain, marks: [] });
                                } else if (typeof desc === "object") {
                                  const root =
                                    desc.type === "doc" ? desc : desc;
                                  (root.content || []).forEach((n) =>
                                    walkContent(n),
                                  );
                                  // Trim trailing line breaks
                                  while (
                                    segments.length &&
                                    segments[segments.length - 1].blockType ===
                                      "break"
                                  ) {
                                    segments.pop();
                                  }
                                }

                                if (!segments.length) return null;

                                // Build flat char array with formatting
                                const chars = [];
                                segments.forEach((seg) => {
                                  const hasBold = (seg.marks || []).some(
                                    (m) => m.type === "bold",
                                  );
                                  const hasItalic = (seg.marks || []).some(
                                    (m) => m.type === "italic",
                                  );
                                  const hasUnderline = (seg.marks || []).some(
                                    (m) => m.type === "underline",
                                  );
                                  const hasStrike = (seg.marks || []).some(
                                    (m) => m.type === "strike",
                                  );
                                  for (const ch of seg.text) {
                                    chars.push({
                                      ch,
                                      bold: hasBold,
                                      italic: hasItalic,
                                      underline: hasUnderline,
                                      strike: hasStrike,
                                      blockType: seg.blockType,
                                    });
                                  }
                                });

                                if (!chars.length) return null;

                                // Group chars into words (split on spaces), preserving formatting per char
                                const words = [];
                                let currentWord = [];
                                chars.forEach((c) => {
                                  if (c.ch === "\n") {
                                    if (currentWord.length) {
                                      words.push(currentWord);
                                      currentWord = [];
                                    }
                                    words.push([{ ...c, isBreak: true }]);
                                  } else if (c.ch === " ") {
                                    if (currentWord.length) {
                                      words.push(currentWord);
                                      currentWord = [];
                                    }
                                  } else {
                                    currentWord.push(c);
                                  }
                                });
                                if (currentWord.length) words.push(currentWord);

                                return (
                                  <div className="flex flex-col overflow-hidden">
                                    <motion.div
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
                                      className="text-[#7A736C] dark:text-[#B5AFA5] text-[14px] leading-relaxed mt-1 break-words whitespace-normal"
                                    >
                                      {words.map((word, wordIndex) => {
                                        // Line break
                                        if (
                                          word.length === 1 &&
                                          word[0].isBreak
                                        ) {
                                          return <br key={`br-${wordIndex}`} />;
                                        }
                                        return (
                                          <span
                                            key={wordIndex}
                                            className="inline-block whitespace-nowrap"
                                          >
                                            {word.map((c, charIndex) => {
                                              let className = "inline-block";
                                              if (c.bold)
                                                className += " font-bold";
                                              if (c.italic)
                                                className += " italic";
                                              if (c.underline)
                                                className += " underline";
                                              if (c.strike)
                                                className += " line-through";
                                              return (
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
                                                  className={className}
                                                >
                                                  {c.ch}
                                                </motion.span>
                                              );
                                            })}
                                            {wordIndex < words.length - 1 &&
                                              !(
                                                words[wordIndex + 1]?.length ===
                                                  1 &&
                                                words[wordIndex + 1]?.[0]
                                                  ?.isBreak
                                              ) && (
                                                <span className="inline-block">
                                                  &nbsp;
                                                </span>
                                              )}
                                          </span>
                                        );
                                      })}
                                    </motion.div>
                                  </div>
                                );
                              })()}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="experience-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="w-8 h-8 shrink-0" />
                <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-[#E5E2DB]/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.work)}
                      className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Experience
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Message 10 - You: Testimonials prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 13 && !(preview && reviews.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
            <div className="flex flex-col gap-1 max-w-[85%] items-end">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                You
              </span>
              <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                What do clients say about your work?
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 11 + 12 - Testimonials (or empty state) */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 14 && !(preview && reviews.length === 0) && (
          <>
            {reviews.length > 0 ? (
              <>
                {/* Testimonials Intro */}
                <motion.div
                  key="testimonials-intro"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 max-w-[85%] relative group/msg"
                >
                  <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                    {chatRevealStep < 15 && (
                      <motion.div
                        layoutId="matt-avatar-sequence"
                        className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                      >
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                  </div>
                  <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                    {chatRevealStep === 14 ? (
                      <div className="flex space-x-1.5 items-center px-1">
                        <motion.div
                          className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        />
                      </div>
                    ) : (
                      "Here's what a few clients have said after working with me"
                    )}
                  </div>
                </motion.div>

                {/* Testimonial Card */}
                {chatRevealStep >= 15 && (
                  <motion.div
                    key="testimonial-card"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 max-w-[85%] relative group/msg"
                  >
                    {canEdit && (
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (reviews[0]) {
                              setSelectedReview(reviews[0]);
                            }
                            openSidebar(sidebars.review);
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
                    <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                      <motion.div
                        layoutId="matt-avatar-sequence"
                        className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                      >
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                    <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <img
                            src={
                              reviews[0]?.avatar?.url ||
                              reviews[0]?.avatar ||
                              ""
                            }
                            alt={reviews[0]?.name || "Reviewer"}
                            className="w-full h-full object-cover bg-gray-200 dark:bg-gray-800"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://i.pravatar.cc/150?u=a042581f4e29026704d";
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px]">
                            {reviews[0]?.name || "Anonymous"}
                          </span>
                          {reviews[0]?.designation && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5 text-[#0077b5]"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                                {reviews[0].designation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px] leading-relaxed italic">
                        {reviews[0]?.description
                          ? `"${tiptapToDisplayString(reviews[0].description)}"`
                          : ""}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                key="testimonials-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="w-8 h-8 shrink-0" />
                <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-[#E5E2DB]/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.review)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
                    >
                      Add Testimonial
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Message 14 - You: Story prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 16 && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
            <div className="flex flex-col gap-1 max-w-[85%] items-end">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                You
              </span>
              <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                Tell me more about you
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 15 - Story Images */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 17 && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= 18 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              {chatRevealStep < 18 && (
                <motion.div
                  layoutId="matt-avatar-sequence"
                  className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                {userDetails?.firstName || "Me"}
              </span>
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-3 sm:p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-fit">
                {chatRevealStep === 17 ? (
                  <div className="flex space-x-1.5 items-center px-1 min-h-[46px]">
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                ) : aboutImages.length > 0 ? (
                  <div className="flex gap-2 my-1 mx-1">
                    {aboutImages.slice(0, 2).map((img, idx) => {
                      const imgSrc = img?.src || img?.key || img;
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05, zIndex: 10 }}
                          onClick={() => setSelectedStoryImage(imgSrc)}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 cursor-pointer"
                        >
                          <img
                            src={imgSrc}
                            alt={`Story ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : canEdit ? (
                  <button
                    onClick={() => openSidebar?.(sidebars.about)}
                    className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors px-2 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Story Images
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 16 - Story Text */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 18 && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              <motion.div
                layoutId="matt-avatar-sequence"
                className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
              >
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
            {hasAboutDescription ? (
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5">
                <p>
                  {aboutDescription.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
            ) : canEdit ? (
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5">
                <button
                  onClick={() => openSidebar?.(sidebars.about)}
                  className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add your story
                </button>
              </div>
            ) : (
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5">
                That's my story so far!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 17 - You: Contact prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 19 && !(preview && !email && !phone) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
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
            <div className="flex flex-col gap-1 max-w-[85%] items-end">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                You
              </span>
              <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                Where can I reach you?
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 18 - Contact options */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 20 && !(preview && !email && !phone) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= 21 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.footer);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              {chatRevealStep < 21 && (
                <motion.div
                  layoutId="matt-avatar-sequence"
                  className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>
            <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
              {chatRevealStep === 20 ? (
                <div className="flex space-x-1.5 items-center px-1 min-h-[22px]">
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-[#7A736C] dark:bg-[#B5AFA5] rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: 0.4,
                    }}
                  />
                </div>
              ) : email || phone ? (
                <div className="space-y-3">
                  <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                    You can primarily reach me on{email ? " mail" : ""}
                    {email && phone ? " or" : ""}
                    {phone ? " phone" : ""}
                  </p>
                  <div className="space-y-2">
                    {email && (
                      <button
                        onClick={() => handleCopy(email, "email")}
                        className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                      >
                        {copiedField === "email" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                        )}
                        {copiedField === "email" ? "Copied!" : "Copy mail"}
                      </button>
                    )}
                    {phone && (
                      <button
                        onClick={() => handleCopy(phone, "phone")}
                        className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                      >
                        {copiedField === "phone" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                        )}
                        {copiedField === "phone" ? "Copied!" : "Copy phone"}
                      </button>
                    )}
                  </div>
                </div>
              ) : canEdit ? (
                <button
                  onClick={() => openSidebar?.(sidebars.footer)}
                  className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add contact info
                </button>
              ) : (
                <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                  Feel free to reach out!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message 19 - Social links */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= 21 &&
          (() => {
            const socialLinks = [
              socials?.linkedin && {
                label: "Connect on LinkedIn",
                icon: Linkedin,
                href: socials.linkedin,
              },
              socials?.twitter && {
                label: "Connect on X",
                icon: Twitter,
                href: socials.twitter,
              },
              socials?.instagram && {
                label: "Follow on Instagram",
                icon: Instagram,
                href: socials.instagram,
              },
              portfolios?.dribbble && {
                label: "View my Dribbble",
                icon: Dribbble,
                href: portfolios.dribbble,
              },
              portfolios?.behance && {
                label: "View my Behance",
                icon: Globe,
                href: portfolios.behance,
              },
              portfolios?.notion && {
                label: "View my Notion",
                icon: Globe,
                href: portfolios.notion,
              },
              portfolios?.medium && {
                label: "View my Medium",
                icon: Globe,
                href: portfolios.medium,
              },
            ].filter(Boolean);
            const hasResume = resume?.url;
            const hasLinks = socialLinks.length > 0 || hasResume;

            if (!hasLinks && (!canEdit || preview)) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 max-w-[85%] relative group/msg"
              >
                {canEdit && (
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSidebar?.(sidebars.footer);
                      }}
                    >
                      <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                  </div>
                )}
                <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                  <motion.div
                    layoutId="matt-avatar-sequence"
                    className="w-8 h-8 rounded-full overflow-hidden border border-black/5 dark:border-white/5"
                  >
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
                <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
                  {hasLinks ? (
                    <div className="space-y-3">
                      <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px]">
                        You can also
                      </p>
                      <div className="space-y-2">
                        {hasResume && (
                          <button
                            onClick={() =>
                              window.open(
                                resume.url,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-between text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                          >
                            <span>View my Resume</span>
                            <FileText className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                          </button>
                        )}
                        {socialLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <button
                              key={link.label}
                              onClick={() =>
                                window.open(
                                  link.href,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              className="w-full bg-[#F5F3EF] dark:bg-[#35302A] hover:bg-white dark:hover:bg-[#403B35] text-[#1A1A1A] dark:text-[#F0EDE7] py-2.5 px-4 rounded-xl flex items-center justify-between text-[14px] font-medium transition-all shadow-sm border border-black/5 dark:border-white/5 group"
                            >
                              <span>{link.label}</span>
                              <Icon className="w-4 h-4 text-[#7A736C] dark:text-[#B5AFA5] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => openSidebar?.(sidebars.footer)}
                      className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add social links
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {chatRevealStep >= 21 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="flex justify-center pb-8 pt-4 w-full"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 rounded-full bg-[#E5E2DB] dark:bg-[#2A2520] hover:bg-[#D5D0C6] dark:hover:bg-[#35302A] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] flex items-center justify-center transition-all duration-300"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {chatRevealStep >= 21 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center pb-12 w-full"
        >
          <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] font-medium">
            Â© ALL RIGHTS RESERVED.
          </p>
        </motion.div>
      )}

      {/* Image Modal */}
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
}

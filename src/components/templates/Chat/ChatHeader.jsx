import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import ProfileAvatar from "@/components/templates/ProfileAvatar";
import { sidebars } from "@/lib/constant";
import { Switch } from "../Canvas/switch-button";
import { usePersistableThemeToggle } from "@/hooks/usePersistableThemeToggle";
import { TypingIndicator, ChatAvatar } from "./chatUtils";

export default function ChatHeader({ chatRevealStep, s, canEdit }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { introduction, bio, skills = [] } = userDetails || {};

  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const { isDark, toggleTheme } = usePersistableThemeToggle(canEdit);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={{
          opacity: chatRevealStep >= s(1) ? 1 : 0,
          y: chatRevealStep >= s(1) ? 0 : 10,
          filter: chatRevealStep >= s(1) ? "blur(0px)" : "blur(10px)",
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center space-y-4 pt-2 text-center"
      >
        <div className="group/avatar relative cursor-pointer">
          {canEdit && (
            <div className="absolute -inset-2 z-40 flex items-center justify-center opacity-0 transition-opacity group-hover/avatar:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  openSidebar(sidebars.profile);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <ProfileAvatar
            src={avatarSrc}
            size={64}
            innerClassName="border border-black/10 dark:border-white/10"
            shadow={false}
          />
        </div>
        <div className="group/text relative space-y-2">
          {canEdit && (
            <div className="absolute top-1/2 -left-12 z-40 -translate-y-1/2 opacity-0 transition-opacity group-hover/text:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                onClick={(e) => {
                  e.stopPropagation();
                  openSidebar(sidebars.profile);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
              </Button>
            </div>
          )}
          <h1 className="text-scaled-24 font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
            {introduction || "Hey, I'm here."}
          </h1>
          <p className="text-scaled-15 max-w-md leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
            {bio || ""}
          </p>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={{
          opacity: chatRevealStep >= s(1) ? 1 : 0,
          y: chatRevealStep >= s(1) ? 0 : 10,
          filter: chatRevealStep >= s(1) ? "blur(0px)" : "blur(10px)",
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center justify-center gap-3"
      >
        <Switch
          value={isDark}
          onToggle={toggleTheme}
          iconOn={<Moon className="size-4" />}
          iconOff={<Sun className="size-4" />}
        />
      </motion.div>

      {/* Date Separator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: chatRevealStep >= s(1) ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative flex items-center justify-center py-4"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-black/10 dark:border-white/10"></div>
        </div>
        <span className="text-scaled-12 relative px-4 font-medium text-[#7A736C] transition-colors duration-700 dark:text-[#B5AFA5]">
          {format(currentTime, "d EEE, h:mm:ss a")}
        </span>
      </motion.div>

      {/* Intro Message */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {chatRevealStep >= s(2) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="group/msg relative flex max-w-[85%] gap-3"
            >
              {canEdit && chatRevealStep >= s(3) && (
                <div className="absolute top-1/2 left-0 z-40 flex -translate-y-[calc(50%+20px)] gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSidebar(sidebars.profile);
                    }}
                  >
                    <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 dark:border-white/5">
                <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-scaled-11 ml-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                  {userDetails?.firstName || "Me"}
                </span>
                <div className="text-scaled-15 flex min-h-[46px] items-center rounded-2xl rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 leading-relaxed text-[#1A1A1A] transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
                  {chatRevealStep === s(2) ? (
                    <TypingIndicator />
                  ) : (
                    introduction || "Hey! How can I help?"
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills message */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(3) && (skills.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex max-w-[85%] gap-3"
          >
            {canEdit && chatRevealStep > s(3) && (
              <div className="absolute top-1/2 -left-2 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.skills);
                  }}
                >
                  <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep <= s(3)} />
            </div>
            <div className="text-scaled-15 flex min-h-[46px] items-center rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 leading-relaxed text-[#1A1A1A] transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
              {chatRevealStep === s(3) ? (
                <TypingIndicator />
              ) : skills.length > 0 ? (
                `My skills are ${skills.map((sk) => sk.label).join(", ")}`
              ) : (
                "I have a range of skills to offer"
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

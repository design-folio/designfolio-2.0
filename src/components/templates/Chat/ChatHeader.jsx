import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { Switch } from "../Canvas/switch-button";
import { useTheme } from "next-themes";
import { TypingIndicator } from "./chatUtils";

export default function ChatHeader({ chatRevealStep, s, canEdit }) {
  const { userDetails, openModal } = useGlobalContext();
  const { introduction, bio } = userDetails || {};

  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

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
          onToggle={() => setTheme(isDark ? "light" : "dark")}
          iconOn={<Moon className="size-4" />}
          iconOff={<Sun className="size-4" />}
        />
      </motion.div>

      {/* Date Separator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: chatRevealStep >= s(1) ? 1 : 0 }}
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

      {/* Intro Message */}
      <div className="space-y-6 pb-6">
        <AnimatePresence mode="popLayout">
          {chatRevealStep >= s(2) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 max-w-[85%] relative group/msg"
            >
              {canEdit && chatRevealStep >= s(3) && (
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
                <div className="bg-white dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-700 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
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
    </>
  );
}

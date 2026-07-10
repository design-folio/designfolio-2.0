import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Moon, Pencil, Sun } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { Switch } from "./switch-button";
import { usePersistableThemeToggle } from "@/hooks/usePersistableThemeToggle";

function CanvasProfileCard({ isEditing, skills = [], persistTheme = false }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { introduction, bio } = userDetails || {};

  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);
  const { isDark, toggleTheme } = usePersistableThemeToggle(persistTheme);
  const repeatedSkills =
    skills.length > 0 ? [...skills, ...skills, ...skills, ...skills, ...skills] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.15 }}
      className="group/section relative flex w-full flex-col rounded-[26px] border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            label="Edit Profile"
            onClick={() => openSidebar(sidebars.profile)}
          />
        </CanvasSectionControls>
      )}

      <div className="absolute top-5 right-5 z-20 md:top-6 md:right-6">
        <Switch
          value={isDark}
          onToggle={toggleTheme}
          iconOn={<Moon className="size-3" />}
          iconOff={<Sun className="size-3" />}
        />
      </div>

      {/* Profile content */}
      <div className="flex flex-col items-start gap-8 p-5 md:flex-row md:items-center md:p-6">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-black/5 shadow-sm dark:border-white/10">
          <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
        </div>
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-scaled-24 pr-12 leading-tight font-semibold tracking-tight text-pretty text-[#1A1A1A] dark:text-[#F0EDE7]">
            {introduction}
          </h1>
          <p className="text-scaled-16 leading-relaxed text-pretty text-[#7A736C] dark:text-[#B5AFA5]">
            {bio}
          </p>
        </div>
      </div>

      {/* Skills strip — merged from CanvasSkillsMarquee */}
      {skills.length > 0 && (
        <div className="relative rounded-b-[26px]">
          {isEditing && (
            <CanvasSectionControls>
              <CanvasSectionButton
                icon={<Pencil className="h-3.5 w-3.5" />}
                label="Edit Skills"
                onClick={() => openSidebar(sidebars.skills)}
              />
            </CanvasSectionControls>
          )}
          <div className="relative w-full overflow-hidden rounded-b-[26px] border-t border-[#E5D7C4] bg-linear-to-b from-[#EEE9E3] to-[#F4F1EC] py-2 dark:border-white/10 dark:from-[#252119] dark:to-[#2B2620]">
            <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-linear-to-r from-[#F0EBE5] to-transparent dark:from-[#272219]" />
            <div className="absolute top-0 right-0 bottom-0 z-10 w-12 bg-linear-to-l from-[#F0EBE5] to-transparent dark:from-[#272219]" />
            <motion.div
              className="flex gap-4 whitespace-nowrap"
              style={{ willChange: "transform" }}
              animate={{ x: [0, "-50%"] }}
              transition={{ ease: "linear", duration: 20, repeat: Infinity }}
            >
              {repeatedSkills.map((skill, index) => (
                <div key={index} className="flex shrink-0 items-center gap-4">
                  <span className="text-[12px] font-medium tracking-wider text-[#7A736C] uppercase dark:text-[#B5AFA5]">
                    {skill.label}
                  </span>
                  <div className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                    </svg>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(CanvasProfileCard);

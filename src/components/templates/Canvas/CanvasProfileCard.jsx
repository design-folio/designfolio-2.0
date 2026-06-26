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
      className="bg-white dark:bg-[#2A2520] rounded-[26px] border border-[#E5D7C4] dark:border-white/10 w-full relative group/section flex flex-col"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="w-3.5 h-3.5" />}
            label="Edit Profile"
            onClick={() => openSidebar(sidebars.profile)}
          />
        </CanvasSectionControls>
      )}

      <div className="absolute top-5 right-5 md:top-6 md:right-6 z-20">
        <Switch
          value={isDark}
          onToggle={toggleTheme}
          iconOn={<Moon className="size-3" />}
          iconOff={<Sun className="size-3" />}
        />
      </div>

      {/* Profile content */}
      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10 shadow-sm">
          <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-[24px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] tracking-tight leading-tight text-pretty pr-12">
            {introduction}
          </h1>
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed text-pretty">
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
                icon={<Pencil className="w-3.5 h-3.5" />}
                label="Edit Skills"
                onClick={() => openSidebar(sidebars.skills)}
              />
            </CanvasSectionControls>
          )}
          <div className="border-t border-[#E5D7C4] dark:border-white/10 py-2 overflow-hidden relative w-full bg-linear-to-b from-[#EEE9E3] to-[#F4F1EC] dark:from-[#252119] dark:to-[#2B2620] rounded-b-[26px]">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-[#F0EBE5] dark:from-[#272219] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-[#F0EBE5] dark:from-[#272219] to-transparent z-10" />
            <motion.div
              className="flex gap-4 whitespace-nowrap"
              animate={{ x: [0, "-50%"] }}
              transition={{ ease: "linear", duration: 20, repeat: Infinity }}
            >
              {repeatedSkills.map((skill, index) => (
                <div key={index} className="flex gap-4 items-center shrink-0">
                  <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
                    {skill.label}
                  </span>
                  <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
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

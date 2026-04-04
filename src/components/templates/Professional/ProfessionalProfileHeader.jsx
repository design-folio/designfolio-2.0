import React, { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, UserCircle } from "lucide-react";
import { format } from "date-fns";
import CinematicThemeSwitcher from "./cinematic-theme-switcher";
import { itemVariants } from "./professional-utils";

function ProfessionalProfileHeader({
  isEditing,
  persistTheme = false,
  avatarSrc,
  displayName,
  bio,
  userRole,
  currentTime,
  onEditProfile,
  onEditPersona,
}) {
  return (
    <>
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center w-full relative group/section"
      >
        {isEditing && (
          <div className="absolute top-4 left-4 z-10 transition-opacity opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors"
              onClick={onEditProfile}
            >
              <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          </div>
        )}
        <div className="absolute top-0 right-4 z-10">
          <CinematicThemeSwitcher persist={persistTheme} />
        </div>

        <div className="w-[80px] h-[80px] bg-[#E37941] mb-6 flex items-center justify-center overflow-hidden shrink-0 mt-2">
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.2)" }}
          />
        </div>

        <div className="w-full flex mb-6 relative overflow-hidden items-center h-[100px] md:h-[120px]">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [0, "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[...Array(4)].map((_, i) => (
              <h1
                key={i}
                className="text-[110px] md:text-[140px] leading-[0.8] font-pixelify tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7] select-none mt-6 pr-12"
              >
                {displayName}
              </h1>
            ))}
          </motion.div>
        </div>

        <div className="text-center font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[16px] leading-[1.8] mb-12 px-4">
          {bio ? bio.split("\n").map((line, i) => <p key={i}>{line}</p>) : null}
        </div>
      </motion.div>

      {/* Time / Role row */}
      <div className="border-t border-[#D5D0C6] dark:border-[#3A352E] flex justify-between items-center px-4 py-2.5 font-jetbrains text-[13px] uppercase tracking-wide text-[#1A1A1A] dark:text-[#B5AFA5] relative group/role">
        <div className="flex items-center gap-2">
          <span>{format(currentTime, "E, MMM d")}</span>
          <span className="text-[#E37941] text-[8px] mt-[1px]">◆</span>
          <span>{format(currentTime, "h:mm:ss a")}</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] opacity-0 group-hover/role:opacity-100 transition-opacity"
              onClick={onEditPersona}
            >
              <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          )}
          <span className="tracking-wider">{(userRole || "").toUpperCase()}</span>

        </div>
      </div>
    </>
  );
}

export default memo(ProfessionalProfileHeader);

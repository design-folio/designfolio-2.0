import React, { memo, useEffect, useState } from "react";
import { motion } from "motion/react";
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
  onEditProfile,
  onEditPersona,
}) {
  /** Clock only after mount — avoids hydration mismatch (server vs client `new Date()`). */
  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    const tick = () => setCurrentTime(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="group/section relative flex w-full flex-col items-center"
      >
        {isEditing && (
          <div className="absolute top-4 left-4 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover/section:opacity-100">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-full border-black/10 bg-white p-0 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
              onClick={onEditProfile}
            >
              <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          </div>
        )}
        <div className="absolute top-0 right-4 z-10">
          <CinematicThemeSwitcher persist={persistTheme} />
        </div>

        <div className="mt-2 mb-6 flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden bg-[#E37941]">
          <img
            src={avatarSrc}
            alt="Profile"
            className="h-full w-full object-cover"
            style={{ filter: "contrast(1.2)" }}
          />
        </div>

        <div className="relative mb-6 flex h-[100px] w-full items-center overflow-hidden md:h-[120px]">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [0, "-50%"] }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {[...Array(4)].map((_, i) => (
              <h1
                key={i}
                className="font-pixelify mt-6 pr-12 text-[110px] leading-[0.8] tracking-tight text-[#1A1A1A] select-none md:text-[140px] dark:text-[#F0EDE7]"
              >
                {displayName}
              </h1>
            ))}
          </motion.div>
        </div>

        <div className="text-scaled-16 font-jetbrains mb-12 px-4 text-center leading-[1.8] text-[#1A1A1A] dark:text-[#F0EDE7]">
          {bio ? bio.split("\n").map((line, i) => <p key={i}>{line}</p>) : null}
        </div>
      </motion.div>

      {/* Time / Role row */}
      <div className="font-jetbrains group/role relative flex items-center justify-between border-t border-[#D5D0C6] px-4 py-2.5 text-[13px] tracking-wide text-[#1A1A1A] uppercase dark:border-[#3A352E] dark:text-[#B5AFA5]">
        <div className="flex min-h-[1.25em] items-center gap-2">
          {currentTime ? (
            <>
              <span>{format(currentTime, "E, MMM d")}</span>
              <span className="mt-[1px] text-[8px] text-[#E37941]">◆</span>
              <span className="tabular-nums">{format(currentTime, "h:mm:ss a")}</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 rounded-full border-black/10 bg-white p-0 opacity-0 shadow-sm transition-opacity group-hover/role:opacity-100 hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
              onClick={onEditPersona}
            >
              <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          )}
          <span className="tracking-wider">{(userRole || "").toUpperCase()}</span>
        </div>
      </div>
    </>
  );
}

export default memo(ProfessionalProfileHeader);

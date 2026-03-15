import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";

function CanvasProfileCard({ isEditing }) {
  const { userDetails, openModal } = useGlobalContext();
  const { introduction, bio } = userDetails || {};

  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  return (
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
  );
}

export default React.memo(CanvasProfileCard);

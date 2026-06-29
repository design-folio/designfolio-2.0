import { useState } from "react";
import { motion } from "motion/react";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { fadeUp } from "./motion-constants";

export function SharerBadge({ sharer, sharerUsername }) {
  const [imgBroken, setImgBroken] = useState(false);
  const name = sharer
    ? [sharer.firstName, sharer.lastName].filter(Boolean).join(" ") || sharerUsername
    : null;
  if (!name) return null;
  const avatarUrl = sharer ? getUserAvatarImage(sharer) : null;

  return (
    <motion.div variants={fadeUp} className="mb-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white px-3.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:border-[#302B28] dark:bg-[#28231E]">
        {avatarUrl && !imgBroken ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-5 w-5 shrink-0 rounded-full object-cover"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF553E] to-[#a855f7] text-[9px] font-bold text-white">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-foreground/55 text-xs">
          <span className="text-foreground font-medium">{name}</span> shared this with you
        </span>
      </div>
    </motion.div>
  );
}

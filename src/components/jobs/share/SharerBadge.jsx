import { useState } from "react";
import { motion } from "framer-motion";
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
      <div className="inline-flex items-center gap-2 bg-white dark:bg-[#28231E] border border-black/[0.05] dark:border-[#302B28] rounded-full px-3.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {avatarUrl && !imgBroken ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF553E] to-[#a855f7] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-xs text-foreground/55">
          <span className="font-medium text-foreground">{name}</span> shared this with you
        </span>
      </div>
    </motion.div>
  );
}

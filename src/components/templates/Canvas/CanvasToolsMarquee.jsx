import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";

function CanvasToolsMarquee({ isEditing }) {
  const { userDetails, openModal } = useGlobalContext();
  const { tools = [] } = userDetails || {};

  const repeatedTools = useMemo(() => Array(12).fill(tools).flat(), [tools]);

  if (tools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.75,
      }}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 py-2 w-full relative group/section"
    >
      {isEditing && (
        <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal?.(modals.tools)}
            className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              Add Tool
            </span>
          </Button>
        </div>
      )}
      <div className="overflow-hidden relative w-full rounded-[32px]">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>

        <motion.div
          className="flex gap-8 py-1 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        >
          {repeatedTools.map((tool, i) => (
            <img
              key={i}
              src={tool.image}
              alt={tool.label}
              className="flex-shrink-0 w-9 h-9 hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasToolsMarquee);

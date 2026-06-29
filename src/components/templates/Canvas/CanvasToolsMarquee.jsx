import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";

function CanvasToolsMarquee({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
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
      className="group/section relative w-full rounded-[26px] border border-[#E5D7C4] bg-white py-2 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Plus className="h-3.5 w-3.5" />}
            label="Add Tool"
            onClick={() => openSidebar(sidebars.tools)}
          />
          <SectionVisibilityButton
            sectionId="tools"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border border-[#E5D7C4] bg-white shadow-md hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}
      <div className="relative w-full overflow-hidden rounded-[32px]">
        <div className="absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-white/80 to-transparent dark:from-[#2A2520]/80"></div>
        <div className="absolute top-0 right-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white/80 to-transparent dark:from-[#2A2520]/80"></div>

        <motion.div
          className="flex w-max gap-8 py-1"
          animate={{ x: [0, "-50%"] }}
          transition={{ ease: "linear", duration: 75, repeat: Infinity }}
        >
          {repeatedTools.map((tool, i) => (
            <img
              key={i}
              src={tool.image}
              alt={tool.label}
              className="h-9 w-9 shrink-0 cursor-pointer transition-transform hover:scale-110"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasToolsMarquee);

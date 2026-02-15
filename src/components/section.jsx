import React from "react";
import Text from "./text";
import { PencilIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/buttonNew";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";

/** Reusable hide/show section button for templates that don't use Section wrapper (Builder2 (Chat),Minimal,Portfolio) */
export function SectionVisibilityButton({ sectionId, className = "" }) {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionHidden = hiddenSections.includes(sectionId);

  const handleToggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedHiddenSections = isSectionHidden
      ? hiddenSections.filter(id => id !== sectionId)
      : [...hiddenSections, sectionId];

    // Update locally (no flicker)
    setUserDetails(prev => ({
      ...prev,
      hiddenSections: updatedHiddenSections,
    }));

    // Update cache without replacing full user
    updateCache("userDetails", prev => ({
      ...prev,
      hiddenSections: updatedHiddenSections,
    }));

    // Fire and forget backend update
    _updateUser({ hiddenSections: updatedHiddenSections });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn("h-11 w-11", isSectionHidden && "text-[#F59E0b]", className)}
            onClick={handleToggleVisibility}
            type="button"
            aria-label={isSectionHidden ? "Hidden" : "Hide"}
          >
            {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="bg-tooltip-bg-color text-tooltip-text-color border-0 px-4 py-2 rounded-xl shadow-xl">
          <span className="text-sm font-medium">{isSectionHidden ? "Hidden" : "Hide"}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Section({
  children,
  title,
  icon = <PencilIcon className="text-df-icon-color cursor-pointer" />,
  onClick,
  edit,
  btnType = "secondary",
  wallpaper,
  actions, // Custom actions element (for multiple buttons)
  showStar = false,
  className = "",
  headerClassName = "",
  contentClassName = "",
  sectionId, // Section identifier for visibility toggle (e.g., 'projects', 'reviews', 'tools', 'works', 'about')
  tooltip,
}) {

  return (
    <div
      className={cn(
        "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-6 break-words border-0 backdrop-blur-sm relative",
        className
      )}
    >

      <div className={cn("flex items-center justify-between", headerClassName)}>
        <Text
          size="p-xs-uppercase"
          className="text-sm text-df-description-color"
        >
          {title}
        </Text>
        {edit && (
          <div className="flex items-center gap-2">
            {sectionId && (
              <SectionVisibilityButton sectionId={sectionId} />
            )}
            {actions ? (
              actions
            ) : (
              icon && (
                tooltip ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-11 w-11" onClick={onClick} type={btnType} size="icon" aria-label={tooltip}>{icon}</Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={8} className="bg-tooltip-bg-color text-tooltip-text-color border-0 px-4 py-2 rounded-xl shadow-xl">
                        <span className="text-sm font-medium">{tooltip}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button variant="secondary" className="h-11 w-11" onClick={onClick} type={btnType} size="icon" >{icon}</Button>
                )
              )
            )}
          </div>
        )}
        {!edit && showStar && (
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-foreground-landing/30"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </motion.svg>
        )}
      </div>
      <div className={cn("mt-4 md:mt-5", contentClassName)}>{children}</div>
    </div>
  );
}

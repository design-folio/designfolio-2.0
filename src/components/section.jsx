import React from "react";
import Text from "./text";
import { PencilIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/buttonNew";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";

/** Reusable hide/show section button for templates that don't use Section wrapper (Minimal, Builder2, Portfolio) */
export function SectionVisibilityButton({ sectionId, className = "" }) {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionHidden = hiddenSections.includes(sectionId);

  const handleToggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let updatedHiddenSections;
    if (isSectionHidden) {
      updatedHiddenSections = hiddenSections.filter((id) => id !== sectionId);
    } else {
      updatedHiddenSections = [...hiddenSections, sectionId];
    }
    setUserDetails((prev) => ({ ...prev, hiddenSections: updatedHiddenSections }));
    _updateUser({ hiddenSections: updatedHiddenSections }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleToggleVisibility}
      title={isSectionHidden ? "Show section" : "Hide section"}
      className={cn(
        "h-11 min-h-11 rounded-full px-3 flex items-center gap-2",
        isSectionHidden && "text-[#F59E0b]",
        className
      )}
    >
      {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span>{isSectionHidden ? "Hidden" : "Hide"}</span>
    </Button>
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
}) {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();

  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionHidden = hiddenSections.includes(sectionId);

  const handleToggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedHiddenSections;
    if (isSectionHidden) {
      // Remove from hidden array
      updatedHiddenSections = hiddenSections.filter(id => id !== sectionId);
    } else {
      // Add to hidden array
      updatedHiddenSections = [...hiddenSections, sectionId];
    }

    setUserDetails((prev) => ({ ...prev, hiddenSections: updatedHiddenSections }));
    _updateUser({ hiddenSections: updatedHiddenSections }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

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
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleVisibility}
                title={isSectionHidden ? "Show section" : "Hide section"}
                className={cn(
                  "h-11 min-h-11 rounded-full px-3 flex items-center gap-2",
                  isSectionHidden && "text-[#F59E0b]"
                )}
              >
                {isSectionHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{isSectionHidden ? "Hidden" : "Hide"}</span>
              </Button>
            )}
            {actions ? (
              actions
            ) : (
              icon && (
                <Button variant="secondary" className="h-11 w-11" onClick={onClick} type={btnType} size="icon" >{icon}</Button>
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

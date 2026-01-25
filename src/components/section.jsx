import React from "react";
import Text from "./text";
import { PencilIcon } from "lucide-react";
import { Button } from "./ui/buttonNew";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";



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
}) {

  return (
    <div
      className={cn(
        "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-6 break-words border-0 backdrop-blur-sm",
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
          actions ? (
            actions
          ) : (
            icon && (
              <Button variant="secondary" className="h-11 w-11" onClick={onClick} type={btnType} size="icon" >{icon}</Button>
            )
          )
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

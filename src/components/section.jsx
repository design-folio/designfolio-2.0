import React from "react";
import Text from "./text";
import { PencilIcon } from "lucide-react";
import { Button } from "./ui/buttonNew";
import { cn } from "@/lib/utils";



export default function Section({
  children,
  title,
  icon = <PencilIcon className="text-df-icon-color cursor-pointer" />,
  onClick,
  edit,
  btnType = "secondary",
  wallpaper,
  actions, // Custom actions element (for multiple buttons)
}) {

  return (
    <div
      className={cn("bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-6 break-words border-0 backdrop-blur-sm")}
    >
      <div className="flex items-center justify-between">
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
      </div>
      <div className="mt-4 md:mt-5">{children}</div>
    </div>
  );
}

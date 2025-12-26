import React from "react";
import CustomSheet from "../CustomSheet";
import { Button } from "./button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const SheetWrapper = ({
  open,
  onClose,
  title,
  width = "320px",
  children,
  className = "",
}) => {
  const isMobileOrTablet = useIsMobile();

  const sheetWidth = isMobileOrTablet ? "100%" : width;

  return (
    <CustomSheet
      open={open}
      onClose={onClose}
      width={sheetWidth}
      showOverlay={isMobileOrTablet}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-border pt-4 pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className={`flex-1 overflow-hidden ${className}`}>
          {children}
        </div>
      </div>
    </CustomSheet>
  );
};


import React from "react";
import CustomSheet from "../CustomSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { Button } from "./button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Reusable wrapper component for CustomSheet (desktop) and Sheet (mobile)
 * Matches the pattern used in ThemePanel
 */
export const SheetWrapper = ({
  open,
  onClose,
  title,
  width = "320px",
  children,
  className = "",
}) => {
  const isMobileOrTablet = useIsMobile();

  // Desktop: CustomSheet
  if (!isMobileOrTablet) {
    return (
      <CustomSheet open={open} onClose={onClose} width={width}>
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
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </CustomSheet>
    );
  }

  // Mobile/Tablet: Sheet
  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={`w-full sm:max-w-md p-0 flex flex-col ${className}`}>
        <SheetHeader className="px-6 py-4 border-b border-border/30 flex-row items-center justify-between space-y-0">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden flex flex-col h-full bg-background">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};


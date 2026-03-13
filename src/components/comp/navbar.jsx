import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChartSpline, Eye, PaintRoller, Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { FluidDropdown } from "@/components/comp/fluid-dropdown";
import { PublishDropdown } from "@/components/comp/publish-dropdown";
import { AvatarDropdown } from "@/components/comp/avatar-dropdown";

export default function Navbar() {
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkOverlay = () => setIsOverlay(window.innerWidth < 1024);
    checkOverlay();
    window.addEventListener("resize", checkOverlay);
    return () => window.removeEventListener("resize", checkOverlay);
  }, []);

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      if (isThemePanelOpen) {
        root.classList.add("theme-panel-open");
      } else {
        root.classList.remove("theme-panel-open");
      }
    }
    return () => {
      if (root) root.classList.remove("theme-panel-open");
    };
  }, [isThemePanelOpen]);

  useEffect(() => {
    if (isThemePanelOpen) {
      window.dispatchEvent(new CustomEvent("panelOpened", { detail: "theme" }));
    }
  }, [isThemePanelOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      window.dispatchEvent(
        new CustomEvent("panelOpened", { detail: "mobile-menu" }),
      );
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handlePanelOpened = (e) => {
      const customEvent = e;
      if (customEvent.detail !== "theme") {
        setIsThemePanelOpen(false);
      }
      if (
        customEvent.detail !== "mobile-menu" &&
        customEvent.detail !== "fluid-dropdown-open"
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("panelOpened", handlePanelOpened);
    return () => window.removeEventListener("panelOpened", handlePanelOpened);
  }, []);

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-4 px-4">
        <nav className="bg-white dark:bg-[#2A2520] border border-black/8 dark:border-white/10 rounded-full shadow-sm pointer-events-auto max-w-[640px] w-full">
          <div className="px-2 md:px-2 py-2 flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg
                width="37"
                height="37"
                viewBox="0 0 37 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <rect width="37" height="37" rx="18.5" fill="#FF553E" />
                <path
                  d="M20.0417 4.625H16.9583V14.7781L9.77902 7.59877L7.59877 9.77902L14.7781 16.9583H4.625V20.0417H14.7781L7.59877 27.221L9.77902 29.4012L16.9583 22.2219V32.375H20.0417V22.2219L27.221 29.4012L29.4012 27.221L22.2219 20.0417H32.375V16.9583H22.2219L29.4012 9.77902L27.221 7.59877L20.0417 14.7781V4.625Z"
                  fill="white"
                />
              </svg>
              <div className="hidden md:block">
                <FluidDropdown />
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center gap-2">
              <AvatarDropdown />

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#1A1A1A] dark:text-[#F0EDE7] h-10 w-10 rounded-full hover:cursor-pointer"
                  >
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="rounded-t-3xl bg-white dark:bg-[#2A2520] border-t border-black/10 dark:border-white/10 p-6 flex flex-col gap-6"
                >
                  <VisuallyHidden>
                    <SheetTitle>Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className="flex flex-col gap-4">
                    <FluidDropdown />
                    <div className="h-px w-full bg-black/10 dark:bg-white/10" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsThemePanelOpen(true);
                      }}
                    >
                      <PaintRoller className="mr-2 h-4 w-4" />
                      Themes settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ChartSpline className="mr-2 h-4 w-4" />
                      Insights
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3531] h-10 px-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <div className="flex w-full items-center justify-between gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 mt-2">
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
                          shai.designfolio.me
                        </span>
                        <span className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">
                          Updated 29 days ago
                        </span>
                      </div>
                      <Button
                        className="bg-black hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-[#E8E8E8] text-white dark:text-black font-medium px-4 h-8 text-xs rounded-lg whitespace-nowrap flex-shrink-0"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                    data-testid="button-insights"
                  >
                    <ChartSpline
                      size={18}
                      className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded"
                >
                  Insights
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                    data-testid="button-themes"
                  >
                    <PaintRoller
                      size={18}
                      className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded"
                >
                  Themes
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full hover:cursor-pointer"
                    data-testid="button-preview"
                  >
                    <Eye
                      size={18}
                      className="transition-transform duration-300 group-hover:scale-125"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-[#1A1A1A] dark:bg-[#F0EDE7] text-[#F0EDE7] dark:text-[#1A1A1A] text-xs px-2 py-1 rounded"
                >
                  Preview
                </TooltipContent>
              </Tooltip>
              <PublishDropdown />
              <AvatarDropdown />
            </div>
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}

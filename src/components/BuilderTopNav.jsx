import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartSpline, Eye, PaintRoller } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebars, getSidebarShiftWidth, isSidebarThatShifts } from "@/lib/constant";
import { PublishDropdown } from "@/components/loggedInHeader/publish-dropdown";
import { TEMPLATE_IDS } from "@/lib/templates";

export function BuilderTopNav() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { activeSidebar, openSidebar, closeSidebar, template } = useGlobalContext();

  if (router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS) {
    return null;
  }

  const shouldShift = !isMobile && isSidebarThatShifts(activeSidebar);
  const shiftWidth = shouldShift ? getSidebarShiftWidth(activeSidebar) : "0px";

  const handleTheme = () => {
    if (activeSidebar === sidebars.theme) {
      closeSidebar(true);
    } else {
      openSidebar(sidebars.theme);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className="pointer-events-none fixed top-0 left-[72px] z-50 hidden justify-center px-4 pt-4 md:flex"
        style={{
          right: shouldShift ? `calc(${shiftWidth} + 16px)` : shiftWidth,
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav className="pointer-events-auto w-fit rounded-full border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-[#2A2520]">
          <div className="flex items-center gap-1.5 px-2 py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group h-9 cursor-pointer gap-1.5 rounded-full border border-black/10 bg-[#F5F5F5] px-3 text-[13px] font-medium text-[#7A736C] hover:bg-[#E8E8E8] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#3A3531] dark:text-[#9E9893] dark:hover:bg-[#4A4540] dark:hover:text-[#F0EDE7]"
                  onClick={() => router.push("/analytics")}
                  data-testid="button-insights"
                >
                  <ChartSpline
                    size={15}
                    className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                  Insights
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                View analytics
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group h-9 cursor-pointer gap-1.5 rounded-full border border-black/10 bg-[#F5F5F5] px-3 text-[13px] font-medium text-[#7A736C] hover:bg-[#E8E8E8] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#3A3531] dark:text-[#9E9893] dark:hover:bg-[#4A4540] dark:hover:text-[#F0EDE7]"
                  onClick={handleTheme}
                  data-testid="button-themes"
                >
                  <PaintRoller
                    size={15}
                    className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                  Themes
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                Customize themes
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="group h-9 w-9 cursor-pointer rounded-full border border-black/10 bg-[#F5F5F5] text-[#7A736C] hover:bg-[#E8E8E8] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#3A3531] dark:text-[#9E9893] dark:hover:bg-[#4A4540] dark:hover:text-[#F0EDE7]"
                  onClick={() => router.push("/portfolio-preview")}
                  data-testid="button-preview"
                >
                  <Eye
                    size={16}
                    className="transition-transform duration-300 group-hover:scale-125"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                Preview portfolio
              </TooltipContent>
            </Tooltip>

            <PublishDropdown />
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}

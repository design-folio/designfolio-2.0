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
        className="hidden md:flex fixed top-0 left-[72px] z-50 justify-center pointer-events-none pt-4 px-4"
        style={{
          right: shouldShift ? `calc(${shiftWidth} + 16px)` : shiftWidth,
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav className="bg-white dark:bg-[#2A2520] border border-black/[0.08] dark:border-white/10 rounded-full shadow-sm pointer-events-auto w-fit">
          <div className="px-2 py-2 flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 px-3 rounded-full cursor-pointer gap-1.5 text-[13px] font-medium"
                  onClick={() => router.push("/analytics")}
                  data-testid="button-insights"
                >
                  <ChartSpline
                    size={15}
                    className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 flex-shrink-0"
                  />
                  Insights
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background text-xs px-2 py-1 rounded"
              >
                View analytics
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 px-3 rounded-full cursor-pointer gap-1.5 text-[13px] font-medium"
                  onClick={handleTheme}
                  data-testid="button-themes"
                >
                  <PaintRoller
                    size={15}
                    className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 flex-shrink-0"
                  />
                  Themes
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background text-xs px-2 py-1 rounded"
              >
                Customize themes
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="group bg-[#F5F5F5] hover:bg-[#E8E8E8] dark:bg-[#3A3531] dark:hover:bg-[#4A4540] border border-black/10 dark:border-white/10 text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] h-9 w-9 rounded-full cursor-pointer"
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
                className="bg-foreground text-background text-xs px-2 py-1 rounded"
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

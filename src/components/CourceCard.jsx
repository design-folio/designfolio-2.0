import { useState, useMemo } from "react";
import { Button } from "@/components/ui/buttonNew";
import { ChevronUp, GraduationCap, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { modals, isSidebarThatShifts, getSidebarShiftWidth } from "@/lib/constant";

const COURSE_CARD_SEEN_KEY = "bottom_notification_seen";

export function CourseCard() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isMobile = useIsMobile();
  const { activeSidebar, showModal, userDetails } = useGlobalContext();
  const isOnboardingModalOpen =
    showModal === modals.onBoardingNewUser || showModal === modals.onboarding;
  const shouldShiftCard = !isMobile && isSidebarThatShifts(activeSidebar);

  const isNewUser = useMemo(() => {
    if (!userDetails?.createdAt) return false;
    const hoursSinceCreation = (new Date() - new Date(userDetails.createdAt)) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  }, [userDetails?.createdAt]);

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(COURSE_CARD_SEEN_KEY);
  });

  if (isOnboardingModalOpen || isNewUser) {
    return null;
  }

  // Handle toggle and save to localStorage when closing
  const handleToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // If user is closing the card, mark it as seen in localStorage
    if (!newExpandedState) {
      localStorage.setItem(COURSE_CARD_SEEN_KEY, "true");
    }
  };

  // Calculate right position: base offset (16px mobile, 24px desktop) + shift width
  const getRightPosition = () => {
    const baseOffset = isMobile ? "16px" : "24px";
    const shiftWidth = getSidebarShiftWidth(activeSidebar);
    if (shouldShiftCard) {
      return `calc(${baseOffset} + ${shiftWidth})`;
    }
    return baseOffset;
  };

  return (
    <>
      <div
        className={`border-border fixed bottom-0 z-50 w-[calc(100%-2rem)] transform rounded-t-2xl border bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] md:w-[300px] dark:bg-[#23252F] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] ${
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
        }`}
        style={{ right: getRightPosition() }}
      >
        {/* Minimized Header / Toggle Area */}
        <button
          onClick={handleToggle}
          className="text-foreground hover:bg-muted/30 dark:hover:bg-muted/20 group flex h-[60px] w-full items-center justify-between rounded-t-2xl bg-white px-5 transition-colors dark:bg-[#23252F]"
        >
          <div className="flex items-center gap-3">
            <div className="border-border/50 flex h-9 w-9 items-center justify-center rounded-xl border bg-[#FAF8F5] transition-transform duration-300 group-hover:scale-105 dark:bg-[#262832]">
              <GraduationCap className="text-foreground/80 h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold tracking-tight">Upcoming Course</span>
            </div>
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
              isExpanded ? "bg-foreground/5 rotate-180" : "bg-transparent"
            }`}
          >
            <ChevronUp className="text-foreground/40 h-4 w-4" />
          </div>
        </button>

        {/* Content Area */}
        <div
          className={`max-h-[80vh] space-y-8 overflow-y-auto p-6 transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-foreground-landing text-base leading-tight font-semibold tracking-tight">
              Vibe coding for Designers
            </h2>
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="text-[12px] font-medium">March 16th, 2026</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-[11px] font-semibold">Seats Available</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-[#f97316]"></div>
                <p className="text-[11px] font-semibold text-[#f97316]">Filling Fast</p>
              </div>
            </div>

            <div className="relative">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#efeee9] dark:bg-[#383A47]">
                <div className="h-full w-[45%] rounded-full bg-[#f97316] transition-all duration-1000 ease-out"></div>
              </div>
            </div>
            <p className="text-foreground text-[12px] font-medium">24 of 30 seats remaining</p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setIsPopoverOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90 no-default-hover-elevate h-12 w-full rounded-full text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Know More
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <DialogContent className="bg-background h-[90vh] w-[90vw] max-w-[90vw] overflow-hidden border-none p-0 shadow-2xl [&>button]:hidden">
          <div className="relative flex h-full w-full flex-col">
            <div className="absolute top-4 right-4 z-50">
              <DialogClose asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="hover-elevate rounded-full shadow-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <iframe
              src="https://launchanyway.vercel.app/"
              className="h-full w-full flex-1 border-none"
              title="Launch Anyway"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

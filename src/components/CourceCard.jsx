import { useState, useEffect } from "react";
import { Button } from "@/components/ui/buttonNew";
import { ChevronUp, GraduationCap, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { modals, isSidebarThatShifts, getSidebarShiftWidth } from "@/lib/constant";

const COURSE_CARD_SEEN_KEY = "bottom_notification_seen";

export function CourseCard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const isMobile = useIsMobile();
    const { activeSidebar, showModal, userDetails } = useGlobalContext();
    const isOnboardingModalOpen = showModal === modals.onBoardingNewUser || showModal === modals.onboarding;
    const shouldShiftCard = !isMobile && isSidebarThatShifts(activeSidebar);

    useEffect(() => {
        const hasSeenCard = localStorage.getItem(COURSE_CARD_SEEN_KEY);

        // Check if user was created less than 24 hours ago
        const isNewUser = (() => {
            if (!userDetails?.createdAt) return false;
            const createdAt = new Date(userDetails.createdAt);
            const now = new Date();
            const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
            return hoursSinceCreation < 24;
        })();
        if (!hasSeenCard && !isOnboardingModalOpen && !isNewUser) {
            setIsExpanded(true);
        }
    }, [isOnboardingModalOpen, userDetails?.createdAt]);

    // Don't render if onboarding modal is open or if user hasn't completed onboarding
    if (isOnboardingModalOpen) {
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
        const baseOffset = isMobile ? '16px' : '24px';
        const shiftWidth = getSidebarShiftWidth(activeSidebar);
        if (shouldShiftCard) {
            return `calc(${baseOffset} + ${shiftWidth})`;
        }
        return baseOffset;
    };

    return (
        <>
            <div
                className={`fixed bottom-0 z-50 w-[calc(100%-2rem)] md:w-[300px] bg-white dark:bg-[#23252F] border border-border rounded-t-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isExpanded ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
                    }`}
                style={{ right: getRightPosition() }}
            >
                {/* Minimized Header / Toggle Area */}
                <button
                    onClick={handleToggle}
                    className="w-full h-[60px] flex items-center justify-between px-5 bg-white dark:bg-[#23252F] text-foreground rounded-t-2xl hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] dark:bg-[#262832] border border-border/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <GraduationCap className="w-4.5 h-4.5 text-foreground/80" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-sm font-bold tracking-tight">
                                Upcoming Course
                            </span>
                        </div>
                    </div>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? "bg-foreground/5 rotate-180" : "bg-transparent"
                            }`}
                    >
                        <ChevronUp className="w-4 h-4 text-foreground/40" />
                    </div>
                </button>

                {/* Content Area */}
                <div
                    className={`p-6 space-y-8 overflow-y-auto max-h-[80vh] transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold tracking-tight text-foreground-landing leading-tight">
                            Vibe coding for Designers
                        </h2>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[12px] font-medium">February 15th, 2026</span>
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                Seats Available
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                                <p className="text-[11px] font-semibold text-[#f97316]">
                                    Filling Fast
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="h-1.5 w-full bg-[#efeee9] dark:bg-[#383A47] rounded-full overflow-hidden">
                                <div className="h-full w-[45%] bg-[#f97316] rounded-full transition-all duration-1000 ease-out"></div>
                            </div>
                        </div>
                        <p className="text-[12px] font-medium text-foreground">
                            19 of 30 seats remaining
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={() => setIsPopoverOpen(true)}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] no-default-hover-elevate"
                        >
                            Know More
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] p-0 overflow-hidden border-none bg-background shadow-2xl [&>button]:hidden">
                    <div className="relative w-full h-full flex flex-col">
                        <div className="absolute top-4 right-4 z-50">
                            <DialogClose asChild>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="rounded-full shadow-lg hover-elevate"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogClose>
                        </div>
                        <iframe
                            src="https://launchanyway.vercel.app/"
                            className="flex-1 w-full h-full border-none"
                            title="Launch Anyway"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

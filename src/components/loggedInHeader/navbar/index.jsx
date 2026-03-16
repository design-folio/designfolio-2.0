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
import {
  ChartSpline,
  Eye,
  PaintRoller,
  Menu,
  LogOut,
  Settings,
  Check,
  Copy,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FluidDropdown } from "./fluid-dropdown";
import { PublishDropdown } from "../publish-dropdown";
import { AvatarDropdown } from "../avatar-dropdown";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getSidebarShiftWidth,
  isSidebarThatShifts,
  sidebars,
} from "@/lib/constant";
import { formatTimestamp } from "@/lib/times";
import { _publish } from "@/network/post-request";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import queryClient from "@/network/queryClient";
import { removeCursor } from "@/lib/cursor";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useIsMobile();

  const {
    activeSidebar,
    openSidebar,
    closeSidebar,
    userDetails,
    setUserDetails,
    updateCache,
  } = useGlobalContext();

  const router = useRouter();

  const shouldShift = !isMobile && isSidebarThatShifts(activeSidebar);
  const shiftWidth = shouldShift ? getSidebarShiftWidth(activeSidebar) : "0px";

  const { username, latestPublishDate } = userDetails || {};
  const domain = `${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsVisible(currentY < lastScrollY || currentY <= 150);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleTheme = () => {
    if (activeSidebar === sidebars.theme) {
      closeSidebar(true);
    } else {
      openSidebar(sidebars.theme);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));
        updateCache("userDetails", res?.data?.user);
        toast.success("Published successfully.");
        setIsMobileMenuOpen(false);
      })
      .finally(() => setIsPublishing(false));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(domain);
      setIsCopied(true);
      toast.success("URL copied successfully");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleLogout = () => {
    setUserDetails(null);
    queryClient.removeQueries();
    Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
    localStorage.removeItem("bottom_notification_seen");
    removeCursor();
    router.replace("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <TooltipProvider>
      <div
        className="fixed top-0 left-0 z-50 flex justify-center pointer-events-none pt-4 px-4"
        style={{
          right: shiftWidth,
          transform: isVisible ? "translateY(0)" : "translateY(-120%)",
          transition:
            "transform 0.3s ease-out, right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav className="bg-white dark:bg-[#2A2520] border border-border rounded-full shadow-sm pointer-events-auto max-w-[640px] w-full">
          <div className="px-2 py-2 flex items-center justify-between gap-4 md:gap-8">
            {/* Logo + mode switcher */}
            <div className="flex items-center gap-3">
              <MemoDFLogoV2 className="flex-shrink-0" />
              <div className="hidden md:block">
                <FluidDropdown />
              </div>
            </div>

            {/* Mobile right */}
            <div className="flex md:hidden items-center gap-2">
              <AvatarDropdown onClose={() => setIsMobileMenuOpen(false)} />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-secondary hover:bg-secondary-hover border border-border h-10 w-10 rounded-full"
                  >
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="rounded-t-3xl bg-background border-t border-border p-6 flex flex-col gap-4"
                >
                  <VisuallyHidden>
                    <SheetTitle>Menu</SheetTitle>
                  </VisuallyHidden>

                  <FluidDropdown />
                  <div className="h-px w-full bg-border" />

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-[14px] text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleTheme();
                      }}
                    >
                      <PaintRoller className="mr-2 h-4 w-4" /> Theme settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-[14px] text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/portfolio-preview");
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-[14px] text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/analytics");
                      }}
                    >
                      <ChartSpline className="mr-2 h-4 w-4" /> Insights
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-[14px] text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push("/settings");
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 px-4 text-[14px] text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>

                  <div className="h-px w-full bg-border" />

                  <div className="flex w-full items-center justify-between gap-3 p-3 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl border border-border">
                    <div
                      className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0 cursor-pointer"
                      onClick={() => window.open(`https://${domain}`, "_blank")}
                    >
                      <span className="text-[13px] font-medium text-foreground truncate">
                        {domain}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {latestPublishDate
                          ? `Updated ${formatTimestamp(latestPublishDate)}`
                          : "Not published yet"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-secondary/50"
                        onClick={handleCopy}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-foreground" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        disabled={isPublishing}
                        onClick={handlePublish}
                        className="bg-black hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-[#E8E8E8] text-white dark:text-black font-medium px-4 h-8 text-xs rounded-lg"
                      >
                        {isPublishing ? "Updating…" : "Publish"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-secondary hover:bg-secondary-hover border border-border text-muted-foreground hover:text-foreground h-9 w-9 rounded-full cursor-pointer"
                    onClick={() => router.push("/analytics")}
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
                  className="bg-foreground text-background text-xs px-2 py-1 rounded"
                >
                  Insights
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-secondary hover:bg-secondary-hover border border-border text-muted-foreground hover:text-foreground h-9 w-9 rounded-full cursor-pointer"
                    onClick={handleTheme}
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
                  className="bg-foreground text-background text-xs px-2 py-1 rounded"
                >
                  Themes
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="group bg-secondary hover:bg-secondary-hover border border-border text-muted-foreground hover:text-foreground h-9 w-9 rounded-full cursor-pointer"
                    onClick={() => router.push("/portfolio-preview")}
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
                  className="bg-foreground text-background text-xs px-2 py-1 rounded"
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

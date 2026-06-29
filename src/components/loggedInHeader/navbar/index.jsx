import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChartSpline, Eye, PaintRoller, Menu, LogOut, Settings, Check, Copy } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FluidDropdown } from "./fluid-dropdown";
import { PublishDropdown } from "../publish-dropdown";
import { AvatarDropdown } from "../avatar-dropdown";
import { useGlobalContext } from "@/context/globalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSidebarShiftWidth, isSidebarThatShifts, sidebars } from "@/lib/constant";
import { formatTimestamp } from "@/lib/times";
import { _publish } from "@/network/post-request";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import queryClient from "@/network/queryClient";
import { removeCursor } from "@/lib/cursor";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";
import Link from "next/link";
import { TEMPLATE_IDS, TEMPLATES_BY_ID } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { UpgradePill } from "./UpgradePill";

const MACOS_ROUTES = ["/builder", "/project/[id]/editor", "/project/[id]/preview"];

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
    template,
    setShowSettingsModal,
    setShowUpgradeModal,
    setUpgradeModalSource,
  } = useGlobalContext();

  const router = useRouter();

  const isAiToolsWorkspace = router.pathname === "/builder" && router.query?.view === "ai-tools";

  const isMacOS = template === 4 && MACOS_ROUTES.includes(router.pathname);

  const isAdminROute = router.pathname.startsWith("/admin");
  const shouldShift = !isMobile && isSidebarThatShifts(activeSidebar);
  const shiftWidth = shouldShift ? getSidebarShiftWidth(activeSidebar) : "0px";

  const { username, latestPublishDate } = userDetails || {};
  const domain = `${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  // Scroll hide/show — disabled for MacOS (always visible full-width bar)
  useEffect(() => {
    if (isMacOS) return;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsVisible(currentY < lastScrollY || currentY <= 150);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMacOS]);

  const handleTheme = () => {
    if (activeSidebar === sidebars.theme) {
      closeSidebar(true);
    } else {
      openSidebar(sidebars.theme);
    }
  };

  const handlePublish = () => {
    if (!userDetails?.pro && TEMPLATES_BY_ID[template]?.isPro) {
      setUpgradeModalSource("pro-template");
      setShowUpgradeModal(true);
      return;
    }
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

  // Shared inner nav content
  const navContent = (
    <div className="flex items-center justify-between gap-4 px-2 py-2 md:gap-8 md:px-2">
      {/* Logo + mode switcher */}
      <div className="flex items-center gap-3">
        {/* <Link href="/builder">
          <MemoDFLogoV2 className="shrink-0" />
        </Link> */}
        <div>
          <FluidDropdown />
        </div>
      </div>

      {/* Mobile right */}
      <div className="flex items-center gap-2 md:hidden">
        <AvatarDropdown variant="new" onClose={() => setIsMobileMenuOpen(false)} />
        {!isAiToolsWorkspace && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-secondary hover:bg-secondary-hover border-border text-foreground h-10 w-10 rounded-full border"
              >
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="bg-card border-border flex flex-col gap-4 rounded-t-3xl border-t p-6"
            >
              <SheetTitle>Menu</SheetTitle>

              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-11 w-full justify-start px-4 text-[14px]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleTheme();
                  }}
                >
                  <PaintRoller className="mr-2 h-4 w-4" /> Theme settings
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-11 w-full justify-start px-4 text-[14px]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/portfolio-preview");
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-11 w-full justify-start px-4 text-[14px]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/analytics");
                  }}
                >
                  <ChartSpline className="mr-2 h-4 w-4" /> Insights
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary h-11 w-full justify-start px-4 text-[14px]"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSettingsModal(true);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/5 h-11 w-full justify-start px-4 text-[14px]"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>

              <div className="bg-border h-px w-full" />

              <div className="bg-muted border-border flex w-full items-center justify-between gap-3 rounded-xl border p-3">
                <div
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 overflow-hidden"
                  onClick={() => window.open(`https://${domain}`, "_blank")}
                >
                  <span className="text-foreground truncate text-[13px] font-medium">{domain}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {latestPublishDate
                      ? `Updated ${formatTimestamp(latestPublishDate)}`
                      : "Not published yet"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-xl"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <Check className="text-foreground h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    disabled={isPublishing}
                    onClick={handlePublish}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 rounded-lg px-4 text-xs font-medium"
                  >
                    {isPublishing ? "Updating…" : "Publish"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Desktop right */}
      <div className="hidden items-center gap-2 md:flex">
        {!isAiToolsWorkspace && (
          <>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="group bg-secondary hover:bg-secondary-hover border-border text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer rounded-full border"
                  onClick={() => router.push("/analytics")}
                  data-testid="button-insights"
                >
                  <ChartSpline
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                Insights
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="group bg-secondary hover:bg-secondary-hover border-border text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer rounded-full border"
                  onClick={handleTheme}
                  data-testid="button-themes"
                >
                  <PaintRoller
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                Themes
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="group bg-secondary hover:bg-secondary-hover border-border text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer rounded-full border"
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
                className="bg-foreground text-background rounded px-2 py-1 text-xs"
              >
                Preview
              </TooltipContent>
            </Tooltip>

            <PublishDropdown variant="new" />
          </>
        )}
        <AvatarDropdown variant="new" />
      </div>
    </div>
  );

  // ─── MacOS: full-width flat bar, h-[62px] ───────────────────────────────────
  if (isMacOS) {
    return (
      <TooltipProvider>
        <div
          className="bg-card border-border fixed top-0 left-0 h-[62px] border-b"
          style={{
            zIndex: isMobileMenuOpen ? 10050 : 110,
            right: shiftWidth,
            transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {navContent}
        </div>
      </TooltipProvider>
    );
  }

  // ─── Default: floating pill navbar ──────────────────────────────────────────
  return (
    <TooltipProvider>
      <div
        className="pointer-events-none fixed top-0 left-0 z-50 flex justify-center px-4 pt-4"
        style={{
          right: shouldShift ? `calc(${shiftWidth} + 16px)` : shiftWidth,
          transform: isVisible ? "translateY(0)" : "translateY(-120%)",
          transition: "transform 0.3s ease-out, right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav
          className={cn(
            "bg-card border-border pointer-events-auto w-full rounded-full border shadow-sm",
            template === TEMPLATE_IDS.SPOTLIGHT
              ? "max-w-[848px]"
              : template === TEMPLATE_IDS.CANVAS
                ? "max-w-[848px]"
                : "max-w-[700px]"
          )}
        >
          {navContent}
        </nav>

        {/* Upgrade pill — free users only, desktop non-MacOS */}
        {userDetails && !userDetails.pro && !isMobile && !isMacOS && !activeSidebar && (
          <UpgradePill />
        )}
      </div>
    </TooltipProvider>
  );
}

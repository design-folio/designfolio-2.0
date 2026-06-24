import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LayoutTemplate, Briefcase } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import MemoDFLogoV2 from "../icons/DFLogoV2";

const ALL_NAV_ITEMS = [
  { icon: LayoutTemplate, label: "Portfolio Builder", href: "/builder" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
];

export function JobsFloatingNav() {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState(null);

  useEffect(() => {
    const clearPending = () => setPendingHref(null);
    router.events.on("routeChangeComplete", clearPending);
    router.events.on("routeChangeError", clearPending);
    return () => {
      router.events.off("routeChangeComplete", clearPending);
      router.events.off("routeChangeError", clearPending);
    };
  }, [router.events]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="hidden md:flex fixed top-6 left-6 z-[200] flex-col items-center gap-2 px-2 py-3 rounded-full shadow-sm bg-card border border-border">
        {/* Designfolio logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-default mb-1" data-testid="nav-logo">
              <MemoDFLogoV2 />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className="bg-foreground text-background text-xs px-2 py-1 rounded"
          >
            Designfolio
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-5 h-px bg-border" />

        {/* Nav items */}
        {ALL_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive =
            href === "/builder" ? router.pathname === "/builder" : router.pathname.startsWith(href);
          const isLoading = pendingHref === href;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  onClick={(e) => {
                    // Ignore the active item and modified clicks (new tab, etc.)
                    // so the spinner only shows for a real in-place navigation.
                    if (isActive || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    setPendingHref(href);
                  }}
                >
                  <button
                    data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    aria-busy={isLoading}
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ease-out ${
                      isActive
                        ? "bg-[hsl(46,15%,91%)] text-foreground shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)] scale-[1.08] dark:bg-white/[0.13] dark:text-foreground dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                        : "text-muted-foreground hover:bg-black/[0.07] hover:scale-[1.05] dark:hover:bg-white/10"
                    }`}
                  >
                    {isLoading ? <Spinner className="size-4" /> : <Icon className="w-4 h-4" />}
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                className="bg-foreground text-background text-xs px-2 py-1 rounded"
              >
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

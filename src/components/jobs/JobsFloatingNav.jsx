import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutTemplate, Briefcase } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MemoDFLogoV2 from "../icons/DFLogoV2";

const navItems = [
  {
    icon: LayoutTemplate,
    label: "Portfolio Builder",
    href: "/builder",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    href: "/jobs",
  },
];


/**
 * Floating vertical navigation pill shown on /builder and /jobs pages.
 * Lets the user switch between Portfolio Builder and Jobs.
 */
export function JobsFloatingNav() {
  const router = useRouter();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed top-6 left-6 z-[200] flex flex-col items-center gap-2 bg-white dark:bg-[#2A2520] border border-black/8 dark:border-white/10 px-2 py-3 rounded-full shadow-sm">
        {/* Designfolio logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-default mb-1" data-testid="nav-logo">
              <MemoDFLogoV2 />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background text-xs px-2 py-1 rounded">
            Designfolio
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-5 h-px bg-border" />

        {/* Nav items */}
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            href === "/builder"
              ? router.pathname === "/builder"
              : router.pathname.startsWith(href);
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link href={href}>
                  <button
                    data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-black/[0.07] dark:hover:bg-white/10"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background text-xs px-2 py-1 rounded">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

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

//TODO: TO LAUNCH JOBS FOR ALL USERS — remove this import and the isBetaUser guard below
import { isBetaUser } from "@/lib/betaEnv";
import { useGlobalContext } from "@/context/globalContext";

const ALL_NAV_ITEMS = [
  { icon: LayoutTemplate, label: "Portfolio Builder", href: "/builder" },
  { icon: Briefcase,      label: "Jobs",              href: "/jobs"    },
];


export function JobsFloatingNav({ betaUser }) {
  const router = useRouter();
  const { userDetails } = useGlobalContext();

  //TODO: BETA GATE — remove this block when launching Jobs for all users
  const canAccess = betaUser ?? isBetaUser(userDetails?.email);
  if (!canAccess) return null;

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
        {ALL_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
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
                    className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ease-out ${isActive
                      ? "bg-[hsl(46,15%,91%)] text-foreground shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)] scale-[1.08] dark:bg-white/[0.13] dark:text-foreground dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                      : "text-muted-foreground hover:bg-black/[0.07] hover:scale-[1.05] dark:hover:bg-white/10"
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

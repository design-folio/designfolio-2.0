import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { LayoutGrid, BriefcaseBusiness, Sparkles } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { useGlobalContext } from "@/context/globalContext";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";
import { TEMPLATE_IDS } from "@/lib/templates";

const NAV_ITEMS = [
  {
    icon: LayoutGrid,
    label: "Portfolio",
    href: "/builder",
    isActive: (pathname, query) => pathname === "/builder" && !query?.view,
  },
  {
    icon: BriefcaseBusiness,
    label: "Jobs",
    href: "/jobs",
    isActive: (pathname) => pathname === "/jobs" || pathname.startsWith("/jobs/"),
  },
  {
    icon: Sparkles,
    label: "AI Tools",
    href: "/builder?view=ai-tools",
    isActive: (pathname, query) => pathname === "/builder" && query?.view === "ai-tools",
  },
];

function NavItem({ icon: Icon, label, href, isActive, pendingHref, onNavigate }) {
  const isLoading = pendingHref === href;

  const iconClass = `transition-colors duration-200 ${isActive
      ? "text-[#1A1A1A] dark:text-[#F0F0F0]"
      : "text-[#888888] dark:text-[#666666] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0F0F0]"
    }`;

  return (
    <Link
      href={href}
      className="w-full cursor-pointer"
      onClick={(e) => {
        if (isActive || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        onNavigate(href);
      }}
    >
      <button
        aria-busy={isLoading}
        className="w-full flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer"
      >
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer ${isActive
              ? "bg-[#E2DBD1] dark:bg-[#2E2E2E] shadow-[inset_0_1px_5px_rgba(0,0,0,0.10),inset_0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_1px_3px_rgba(0,0,0,0.40)]"
              : "group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.08]"
            }`}
        >
          {isLoading ? (
            <Spinner className="size-[18px]" />
          ) : (
            <Icon size={20} strokeWidth={1.5} className={iconClass} />
          )}
        </span>
        <span
          className={`text-[11px] font-medium leading-none transition-colors duration-200 cursor-pointer ${isActive
              ? "text-[#1A1A1A] dark:text-[#F0F0F0]"
              : "text-[#777777] dark:text-[#666666] group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0F0F0]"
            }`}
        >
          {label}
        </span>
      </button>
    </Link>
  );
}

export function BuilderSideNav() {
  const router = useRouter();
  const { userDetails, template } = useGlobalContext();
  const [pendingHref, setPendingHref] = useState(null);

  useEffect(() => {
    const clear = () => setPendingHref(null);
    router.events.on("routeChangeComplete", clear);
    router.events.on("routeChangeError", clear);
    return () => {
      router.events.off("routeChangeComplete", clear);
      router.events.off("routeChangeError", clear);
    };
  }, [router.events]);

  const isRetroOsBuilder = router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS;

  if (!userDetails || isRetroOsBuilder) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] z-[200] flex-col items-center"
        style={{ backgroundColor: "var(--shell-bg)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-full py-5 shrink-0">
          <MemoDFLogoV2 />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-0.5 w-full pt-2 px-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={item.isActive(router.pathname, router.query)}
              pendingHref={pendingHref}
              onNavigate={setPendingHref}
            />
          ))}
        </nav>

        <div className="mt-auto pb-5 flex items-center justify-center">
          <AvatarDropdown variant="sidebar" />
        </div>
      </aside>
    </TooltipProvider>
  );
}

import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import { TEMPLATE_IDS } from "@/lib/templates";

export function FloatingPageContainer({ isSidebarRoute, children }) {
  const router = useRouter();
  const { template } = useGlobalContext();

  const isRetroOsBuilder = router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS;
  const isJobsRoute = router.pathname === "/jobs" || router.pathname.startsWith("/jobs/");
  const shouldFloat = isSidebarRoute && !isRetroOsBuilder;

  if (!shouldFloat) {
    return <>{children}</>;
  }

  if (isJobsRoute) {
    return (
      <div className="dark:bg-background fixed inset-0 flex flex-col bg-[#F0EDE7] pt-[72px] md:top-2 md:right-2 md:bottom-2 md:left-[72px] md:overflow-hidden md:rounded-[32px] md:border md:border-black/[0.07] md:pt-0 md:dark:border-white/[0.07]">
        {children}
      </div>
    );
  }

  // Builder, settings, analytics, project editor:
  // Real card container — clips page background to the rounded boundary so
  // bg-background doesn't bleed into the 8px shell gap areas.
  // Window scroll is locked by html.sidebar-layout in globals.scss; only this
  // container scrolls. Fixed children (AppSidebar, modals, tooltips) are
  // viewport-relative and escape the clip naturally.
  // On mobile the md: classes don't apply — children render in normal flow.
  return (
    <div className="md:bg-background custom-thin-scrollbar md:fixed md:top-2 md:right-2 md:bottom-2 md:left-[72px] md:overflow-y-auto md:rounded-[32px] md:border md:border-black/[0.07] md:dark:border-white/[0.07]">
      {children}
    </div>
  );
}

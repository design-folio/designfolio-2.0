import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import { TEMPLATE_IDS } from "@/lib/templates";

export function FloatingPageContainer({ isSidebarRoute, children }) {
  const router = useRouter();
  const { template } = useGlobalContext();

  const isRetroOsBuilder =
    router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS;
  const isJobsRoute =
    router.pathname === "/jobs" || router.pathname.startsWith("/jobs/");
  const shouldFloat = isSidebarRoute && !isRetroOsBuilder;

  if (!shouldFloat) {
    return <>{children}</>;
  }

  // Jobs uses a fixed inset-0 Kanban layout whose height chain depends on being
  // viewport-anchored. Wrapping it in a container breaks flex-1/min-h-0 chains.
  // Use a visual border overlay (z-150, above page content, below sidebar z-200)
  // and render children normally.
  if (isJobsRoute) {
    return (
      <>
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none fixed top-2 bottom-2 left-[72px] right-2 rounded-[32px] border border-black/[0.07] dark:border-white/[0.07] z-[150]"
        />
        {children}
      </>
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
    <div className="md:fixed md:top-2 md:bottom-2 md:left-[72px] md:right-2 md:bg-background md:overflow-y-auto md:rounded-[32px] md:border md:border-black/[0.07] md:dark:border-white/[0.07]">
      {children}
    </div>
  );
}

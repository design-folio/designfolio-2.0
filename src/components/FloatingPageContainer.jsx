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
  // Outer: overflow-hidden + transform:translateZ(0) makes this the containing
  // block for fixed descendants (AppSidebar, blinders) so they open inside the
  // card and don't scroll with content.
  // Inner: the actual scroll container, so the fixed AppSidebar stays pinned.
  return (
    <div
      className="md:bg-background md:fixed md:top-2 md:right-2 md:bottom-2 md:left-[72px] md:overflow-hidden md:rounded-[32px] md:border md:border-black/[0.11] md:dark:border-white/[0.07]"
      style={{ transform: "translateZ(0)" }}
    >
      <div className="custom-thin-scrollbar md:h-full md:overflow-y-auto">{children}</div>
    </div>
  );
}

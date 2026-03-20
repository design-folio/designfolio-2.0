import React, { useEffect, useRef } from "react";
import Analytics from "@/components/analytics";
import { useGlobalContext } from "@/context/globalContext";
import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { TEMPLATE_IDS } from "@/lib/templates";
import WallpaperBackground from "@/components/WallpaperBackground";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarShiftWidth } from "@/lib/constant";
import { useIsMobile } from "@/hooks/use-mobile";

function AnalyticsPage() {
  const {
    wallpaperUrl,
    wallpaperEffects,
    userDetails,
    setWallpaper,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    activeSidebar,
    closeSidebar,
  } = useGlobalContext();

  const isMobile = useIsMobile();
  const lastSidebarRef = useRef(null);
  if (activeSidebar) lastSidebarRef.current = activeSidebar;

  // Compensate for scrollbar gutter when sidebar opens so content doesn't shift.
  useEffect(() => {
    if (activeSidebar && !isMobile) {
      const el = document.documentElement;
      const scrollbarWidth = window.innerWidth - el.clientWidth;
      el.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
    } else {
      document.documentElement.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.paddingRight = "";
    };
  }, [activeSidebar, isMobile]);

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  useEffect(() => {
    if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }
  }, [userDetails?.wallpaper, setWallpaper]);

  const template = userDetails?.template;

  const containerClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "max-w-[640px] mx-auto flex flex-col gap-3 py-[94px] md:py-[124px] px-4 md:px-0";
      case TEMPLATE_IDS.MONO:
        return "max-w-[640px] mx-auto py-[94px] md:py-[124px] custom-dashed-x bg-[#F0EDE7] dark:bg-[#1A1A1A] min-h-screen";
      default:
        return "max-w-[640px]  mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0";
    }
  })();

  // const cardClass = (() => {
  //   switch (template) {
  //     case TEMPLATE_IDS.CANVAS:
  //       return "bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10";
  //     case TEMPLATE_IDS.MONO:
  //       return "px-5 md:px-8 py-8";
  //     default:
  //       return "bg-df-section-card-bg-color p-8 rounded-2xl";
  //   }
  // })();

  const sidebarProviderProps = {
    open: !!activeSidebar,
    onOpenChange: (open) => !open && closeSidebar(true),
    style: {
      "--sidebar-width": getSidebarShiftWidth(lastSidebarRef.current) || "400px",
    },
    defaultOpen: false,
  };

  return (
    <SidebarProvider {...sidebarProviderProps}>
      <div className="flex-1 min-w-0">
        <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
        <div className={containerClass}>
          {template === TEMPLATE_IDS.MONO && <div className="custom-dashed-t" />}

          <Analytics />
          {/* </div> */}
          {template === TEMPLATE_IDS.MONO && <div className="custom-dashed-t" />}
        </div>
      </div>
      <AppSidebar />
    </SidebarProvider>
  );
}

export default AnalyticsPage;
export { getServerSideProps };

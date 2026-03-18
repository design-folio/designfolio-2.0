import React, { useEffect } from "react";
import Analytics from "@/components/analytics";
import { useGlobalContext } from "@/context/globalContext";
import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { sidebars } from "@/lib/constant";
import { TEMPLATE_IDS } from "@/lib/templates";
import WallpaperBackground from "@/components/WallpaperBackground";

function AnalyticsPage() {
  const {
    wallpaperUrl,
    wallpaperEffects,
    userDetails,
    setWallpaper,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    activeSidebar
  } = useGlobalContext();

  // Manage body margin-right based on active sidebar to prevent layout shift during switching
  useEffect(() => {
    const body = document.body;
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    let marginWidth = '0px';
    if (activeSidebar === sidebars.work || activeSidebar === sidebars.review) {
      marginWidth = '500px';
    } else if (activeSidebar === sidebars.theme) {
      marginWidth = '320px';
    }

    body.style.marginRight = marginWidth;

    return () => {
      body.style.marginRight = '0px';
      body.style.transition = '';
    };
  }, [activeSidebar]);

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, [userDetailsIsState, setIsUserDetailsFromCache]);

  // Restore wallpaper from userDetails when component mounts or userDetails changes
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
        return "max-w-[848px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0";
    }
  })();

  const cardClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-8";
      case TEMPLATE_IDS.MONO:
        return "px-5 md:px-8 py-8";
      default:
        return "bg-df-section-card-bg-color p-8 rounded-2xl";
    }
  })();

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <div className={containerClass}>
        {template === TEMPLATE_IDS.MONO && <div className="custom-dashed-t" />}
        <div className={cardClass}>
          <Analytics />
        </div>
        {template === TEMPLATE_IDS.MONO && <div className="custom-dashed-t" />}
      </div>
    </>
  );
}

export default AnalyticsPage;
export { getServerSideProps };

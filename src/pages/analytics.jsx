import React, { useEffect } from "react";
import Analytics from "@/components/analytics";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { hasNoWallpaper } from "@/lib/wallpaper";
import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { sidebars } from "@/lib/constant";

function AnalyticsPage() {
  const {
    wallpaper,
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

  return (
    <div
      className={cn(
        "max-w-[890px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0",
        hasNoWallpaper(wallpaper) ? "bg-df-bg-color" : "bg-transparent"
      )}
    >
      <Analytics />
    </div>
  );
}

export default AnalyticsPage;
export { getServerSideProps };

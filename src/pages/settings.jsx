import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import ChangePassword from "@/components/changePassword";
import DeleteAccount from "@/components/deleteAccount";
import CustomDomain from "@/components/customDomain";
import DefaultDomain from "@/components/defaultDomain";
import Transaction from "@/components/transaction";
import MemoLeftArrow from "@/components/icons/LeftArrow";
import Link from "next/link";
import { TEMPLATE_IDS } from "@/lib/templates";
import WallpaperBackground from "@/components/WallpaperBackground";
import AppSidebar from "@/components/Sidebars";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarShiftWidth } from "@/lib/constant";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Settings() {
  const {
    userDetails,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    domainDetails,
    fetchDomainDetails,
    wallpaperUrl,
    wallpaperEffects,
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

  const template = userDetails?.template;

  const containerClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "max-w-[720px] mx-auto flex flex-col gap-3 py-[94px] md:py-[124px] px-4 md:px-0";
      case TEMPLATE_IDS.MONO:
        return "max-w-[640px] mx-auto py-[94px] md:py-[124px] custom-dashed-x bg-[#F0EDE7] dark:bg-[#1A1A1A] min-h-screen";
      default:
        return "max-w-[640px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0";
    }
  })();

  const cardClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "bg-white dark:bg-[#2A2520] rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-8";
      case TEMPLATE_IDS.MONO:
        return "px-5 md:px-8 py-8";
      case TEMPLATE_IDS.CHATFOLIO:
        return "bg-white dark:bg-[#2A2520] rounded-2xl  p-8";
      case TEMPLATE_IDS.PROFESSIONAL:
        return "bg-white dark:bg-[#2A2520] rounded-2xl  p-8";
      default:
        return "bg-df-section-card-bg-color p-8 rounded-2xl";
    }
  })();

  const isMono = template === TEMPLATE_IDS.MONO;

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
        <main className="min-h-screen">
          <div className={containerClass}>
            {isMono && <div className="custom-dashed-t" />}
            <div className={cardClass}>
              <Link href="/builder">
                <Button
                  variant="secondary"
                  className="rounded-full px-4 h-9 text-sm font-medium"
                >
                  <MemoLeftArrow className="!size-2.5" />
                  Go Back
                </Button>
              </Link>
              <div className="mt-8">
                <DefaultDomain />
              </div>
            </div>

            {isMono && <div className="custom-dashed-t" />}
            <div className={`${cardClass} ${!isMono ? "mt-6" : ""}`}>
              <CustomDomain
                domainDetails={domainDetails}
                fetchDomainDetails={fetchDomainDetails}
              />
            </div>

            {userDetails?.pro && (
              <>
                {isMono && <div className="custom-dashed-t" />}
                <div className={`${cardClass} ${!isMono ? "mt-6" : ""}`}>
                  <Transaction />
                </div>
              </>
            )}

            {isMono && <div className="custom-dashed-t" />}
            <div className={`${cardClass} ${!isMono ? "mt-6" : ""}`}>
              <div className="mt-6">
                {userDetails?.loginMethod == 0 && (
                  <div>
                    <ChangePassword />
                  </div>
                )}
                <div className="mt-10">
                  <DeleteAccount />
                </div>
              </div>
            </div>

            {isMono && <div className="custom-dashed-t" />}
          </div>
        </main>
      </div>
      <AppSidebar />
    </SidebarProvider>
  );
}

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  if (!dfToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: { dfToken: !!dfToken },
  };
};

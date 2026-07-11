import React, { useEffect, useRef, useState, startTransition } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";
import { useTheme } from "next-themes";
import Builder1 from "@/components/builder";
import BottomTask from "@/components/bottomTask";
import Modal from "@/components/modal";
import { modals } from "@/lib/constant";
import Onboarding from "@/components/onboarding-old";
import OnboardingNewUser from "@/components/onboarding";
import DeleteProject from "@/components/deleteProject";
import AddResume from "@/components/addResume";
import AddSocial from "@/components/addSocial";
import AddPortfolioLinks from "@/components/addPortfolioLinks";
import CreateAiProject from "@/components/createAiProject";
import useClient from "@/hooks/useClient";
import { Feedefy } from "@feedefy/react";
import { useRouter } from "next/router";
import { _resendOTP } from "@/network/get-request";
import AddUsername from "@/components/addUsername";
import Builder2 from "@/components/Builder2";
import Minimal from "@/components/templates/Spotlight";
import Portfolio from "@/components/comp/Portfolio";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import ProWarning from "@/components/proWarning";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasNoWallpaper, BACKGROUND_MODE } from "@/lib/wallpaper";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { ReplacePortfolioDialog } from "@/components/ui/ReplacePortfolioDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CourseCard } from "@/components/CourceCard";
import WallpaperBackground from "@/components/WallpaperBackground";
import ContainerResizer from "@/components/resizer/ContainerResizer";
import AiToolsWorkspace from "@/components/AiToolsWorkspace";
import AppSidebar from "@/components/Sidebars";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarShiftWidth } from "@/lib/constant";
import { TEMPLATE_IDS, TEMPLATES_BY_ID } from "@/lib/templates";
import Canvas from "@/components/templates/Canvas";
import Mono from "@/components/templates/Mono";
import Chat from "@/components/templates/Chat";
import Professional from "@/components/templates/Professional";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetails,
    openModal,
    showModal,
    closeModal,
    taskPercentage,
    template,
    isLoadingTemplate,
    setWallpaper,
    wallpaper,
    wallpaperUrl,
    wallpaperColorResolved,
    wallpaperEffects,
    backgroundMode,
    activeSidebar,
    closeSidebar,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
    pendingReplaceAwaitingConfirmation,
    setPendingReplaceAwaitingConfirmation,
    applyPendingPortfolio,
    discardPendingPortfolio,
  } = useGlobalContext();
  const { isClient } = useClient();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { setTheme, resolvedTheme } = useTheme();
  const themeBeforeAiToolsRef = useRef(null);
  // Keep last known sidebar width so closing animation has a non-zero right offset
  const [lastSidebar, setLastSidebar] = useState(() => activeSidebar ?? null);
  useEffect(() => {
    if (activeSidebar != null) startTransition(() => setLastSidebar(activeSidebar));
  }, [activeSidebar]);

  // Lock page scroll when sidebar is open on desktop.
  // Compensates for scrollbar gutter width so content doesn't shift (same trick
  // Compensate for scrollbar gutter when sidebar opens so content doesn't shift.
  // The sidebar panel (position:fixed, bg-sidebar, z-50) covers the native scrollbar
  // visually, so there's no double-scrollbar flicker while the page stays scrollable.
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

  // AI tools view has no dark mode UI: force light when entering, restore when leaving
  useEffect(() => {
    if (router.query?.view === "ai-tools") {
      if (themeBeforeAiToolsRef.current === null && resolvedTheme) {
        themeBeforeAiToolsRef.current = resolvedTheme;
      }
      setTheme("light");
    } else {
      if (themeBeforeAiToolsRef.current) {
        setTheme(themeBeforeAiToolsRef.current);
        themeBeforeAiToolsRef.current = null;
      }
    }
  }, [router.query?.view, setTheme, resolvedTheme]);

  useEffect(() => {
    setIsUserDetailsFromCache(true);
  }, [setIsUserDetailsFromCache]);

  // Auto-scroll to a section when ?scrollTo=<id> is in the URL (e.g. coming back from project editor)
  useEffect(() => {
    const sectionId = router.query?.scrollTo;
    if (!sectionId || !userDetails) return;
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
      } else if (attempts < 10) {
        setTimeout(() => tryScroll(attempts + 1), 150);
      }
    };
    tryScroll();
  }, [router, router.query?.scrollTo, userDetails]);

  // Restore wallpaper from userDetails when component mounts
  useEffect(() => {
    if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }
  }, [userDetails?.wallpaper, setWallpaper]);

  useEffect(() => {
    if (userDetails && !userDetails?.emailVerification) {
      _resendOTP().then(() => {
        router.push("/email-verify");
      });
      return;
    }

    if (userDetails && !userDetails?.username) {
      openModal(modals.username);
    } else if (userDetails) {
      // Note: goal and experienceLevel can be 0, so we check for null/undefined specifically
      const hasGoal = userDetails.goal !== undefined && userDetails.goal !== null;
      const hasExperienceLevel =
        userDetails.experienceLevel !== undefined && userDetails.experienceLevel !== null;
      const hasSkills = userDetails.skills && userDetails.skills.length > 0;
      const hasPersona =
        userDetails.persona && userDetails.persona.value && userDetails.persona.label;
      const needsOnboarding = !hasGoal || !hasExperienceLevel || !hasSkills || !hasPersona;

      const hasPendingResumePrefill =
        typeof window !== "undefined" && !!localStorage.getItem("pending-portfolio-data");

      if (needsOnboarding && !hasPendingResumePrefill) {
        openModal(modals.onBoardingNewUser);
      } else if (
        (!needsOnboarding || hasPendingResumePrefill) &&
        showModal === modals.onBoardingNewUser
      ) {
        // Only close onboarding modal—never close project/tools/other modals
        closeModal();
      }
    } else {
      closeModal();
    }
  }, [userDetails, showModal, closeModal, openModal, router]);

  const modalContent = () => {
    switch (showModal) {
      case modals.onboarding:
        return <Onboarding />;
      case modals.onBoardingNewUser:
        return <OnboardingNewUser />;
      case modals.project:
        return null; // Handled by AppSidebar
      case modals.deleteProject:
        return <DeleteProject />;
      case modals.review:
        return null; // Handled by AppSidebar
      case modals.tools:
        return null; // Handled by AppSidebar
      case modals.work:
        return null; // Handled by AppSidebar
      case modals.resume:
        return <AddResume />;
      case modals.socialMedia:
        return <AddSocial />;
      case modals.portfolioLinks:
        return <AddPortfolioLinks />;
      case modals.username:
        return <AddUsername />;
      case modals.about:
        return null; // Handled by AppSidebar
    }
  };

  if (!userDetails?.emailVerification) {
    return <></>;
  }
  const renderTemplate = () => {
    switch (template) {
      case 0:
        // return <Builder1 />;
        return <Canvas isEditing={true} />;
      case 1:
        return <Chat isEditing={true} />;
        return <Builder2 edit />;
      case 2:
        // return <Spotlight isEditing={true} />;
        return <Minimal userDetails={userDetails} edit />;
      case 3:
        // return <Portfolio userDetails={userDetails} edit />;
        return <Mono isEditing={true} />;
      case 4:
        return <MacOSTemplate userDetails={userDetails} edit />;
      case 5:
        return <Professional isEditing={true} />;

      default:
        return <Builder1 />;
    }
  };

  const sidebarProviderProps = {
    open: !!activeSidebar,
    onOpenChange: (open) => !open && closeSidebar(true),
    style: {
      "--sidebar-width": getSidebarShiftWidth(lastSidebar || activeSidebar) || "400px",
    },
    defaultOpen: false,
  };

  // Logged-in: AI tools live inside builder via ?view=ai-tools (no navigation)
  if (router.query?.view === "ai-tools") {
    return (
      <SidebarProvider {...sidebarProviderProps}>
        <div className="min-w-0 flex-1">
          <AiToolsWorkspace embedInBuilder />
          <Modal
            show={
              showModal &&
              showModal !== modals.aiProject &&
              showModal !== modals.review &&
              showModal !== modals.work &&
              showModal !== modals.project
            }
          >
            {modalContent()}
          </Modal>
          <Modal show={modals.aiProject == showModal} className={"md:block"}>
            <CreateAiProject openModal={openModal} />
          </Modal>
          <UnsavedChangesDialog
            open={showUnsavedWarning && isSwitchingSidebar && pendingSidebarAction?.type === "open"}
            onOpenChange={(open) => {
              if (!open) handleCancelDiscardSidebar();
            }}
            onConfirmDiscard={handleConfirmDiscardSidebar}
            title="Unsaved Changes"
            description="You have unsaved changes. Are you sure you want to switch sidebars and discard them?"
          />
          <ReplacePortfolioDialog
            open={pendingReplaceAwaitingConfirmation}
            onOpenChange={setPendingReplaceAwaitingConfirmation}
            onKeepCurrent={discardPendingPortfolio}
            onReplace={applyPendingPortfolio}
          />
          {isClient && userDetails && (
            <Feedefy
              projectId="a72769ea-5ab2-4ac9-81bd-1abe180d4b66"
              data-feedefy
              data-feedefy-userid={userDetails?.email}
            />
          )}
        </div>
        <AppSidebar />
      </SidebarProvider>
    );
  }

  const t = userDetails?.template ?? TEMPLATE_IDS.CANVAS;

  const isHeaderMode = backgroundMode === BACKGROUND_MODE.HEADER;
  // A visible background is either an image wallpaper or a solid colour.
  const hasBackground = !hasNoWallpaper(wallpaper, template) || !!wallpaperColorResolved;
  // Page shows the full-page background (transparent) only when a background exists AND full-page mode.
  // Header mode + no background both keep the page background solid.
  const transparentForWallpaper = hasBackground && !isHeaderMode;

  return (
    <SidebarProvider {...sidebarProviderProps}>
      <div className="relative min-w-0 flex-1">
        <WallpaperBackground
          wallpaperUrl={wallpaperUrl}
          backgroundColor={wallpaperColorResolved}
          mode={backgroundMode}
          effects={
            t === TEMPLATE_IDS.RETRO_OS
              ? { ...(wallpaperEffects || {}), motion: false }
              : wallpaperEffects
          }
        />
        <main
          className={cn(
            "flex min-h-screen justify-center transition-colors duration-700",
            t === TEMPLATE_IDS.CHATFOLIO &&
              !transparentForWallpaper &&
              "bg-[#F0EDE7] dark:bg-[#1A1A1A]",
            t !== TEMPLATE_IDS.CHATFOLIO &&
              !transparentForWallpaper &&
              "bg-background font-inter text-foreground selection:bg-foreground selection:text-background"
          )}
        >
          <ContainerResizer
            className={cn(
              isHeaderMode && t !== TEMPLATE_IDS.RETRO_OS && "relative z-10",
              {
                [TEMPLATE_IDS.CHATFOLIO]: "py-[94px]",
                [TEMPLATE_IDS.SPOTLIGHT]: "pt-24",
                [TEMPLATE_IDS.PROFESSIONAL]: "pt-24",
                [TEMPLATE_IDS.RETRO_OS]: "",
              }[t] ?? "px-2 pt-24 pb-0 md:px-4 lg:px-0"
            )}
            contentClassName={
              [
                TEMPLATE_IDS.MONO,
                TEMPLATE_IDS.PROFESSIONAL,
                TEMPLATE_IDS.CHATFOLIO,
                TEMPLATE_IDS.SPOTLIGHT,
              ].includes(t)
                ? "mt-[184px]"
                : undefined
            }
          >
            {userDetails && !userDetails?.pro && TEMPLATES_BY_ID[t]?.isPro && <ProWarning />}
            {userDetails && (
              <>
                {isLoadingTemplate ? (
                  <div className="flex min-h-[calc(100vh-126px)] items-center justify-center">
                    <Loader2 className="text-df-orange-color h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  renderTemplate()
                )}
              </>
            )}
            {/* //NOTE: Remove bottom progress bar temporarily */}
            {/* {userDetails && taskPercentage !== 100 && template !== 4 && (
              <BottomTask />
            )} */}
          </ContainerResizer>
          <Modal
            show={
              showModal &&
              showModal !== modals.aiProject &&
              showModal !== modals.review &&
              showModal !== modals.work &&
              showModal !== modals.project
            }
          >
            {modalContent()}
          </Modal>
          <Modal show={modals.aiProject == showModal} className={"md:block"}>
            <CreateAiProject openModal={openModal} />
          </Modal>
          <UnsavedChangesDialog
            open={showUnsavedWarning && isSwitchingSidebar && pendingSidebarAction?.type === "open"}
            onOpenChange={(open) => {
              if (!open) {
                handleCancelDiscardSidebar();
              }
            }}
            onConfirmDiscard={handleConfirmDiscardSidebar}
            title="Unsaved Changes"
            description="You have unsaved changes. Are you sure you want to switch sidebars and discard them?"
          />
          <ReplacePortfolioDialog
            open={pendingReplaceAwaitingConfirmation}
            onOpenChange={setPendingReplaceAwaitingConfirmation}
            onKeepCurrent={discardPendingPortfolio}
            onReplace={applyPendingPortfolio}
          />
          {isClient && userDetails && (
            <Feedefy
              projectId="a72769ea-5ab2-4ac9-81bd-1abe180d4b66"
              data-feedefy
              data-feedefy-userid={userDetails?.email}
            />
          )}
          {/* {!isMobile && <CourseCard />} */}
        </main>
      </div>
      <AppSidebar />
    </SidebarProvider>
  );
}
export { getServerSideProps };

import React, { useEffect } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";
import Builder1 from "@/components/builder";
import BottomTask from "@/components/bottomTask";
import Modal from "@/components/modal";
import { modals, sidebars } from "@/lib/constant";
import Onboarding from "@/components/onboarding-old";
import OnboardingNewUser from "@/components/onboarding";
import AddProject from "@/components/addProject";
import DeleteProject from "@/components/deleteProject";
import AddReview from "@/components/addReview";
import AddTools from "@/components/addTools";
import AddWork from "@/components/addWork";
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
import Minimal from "@/components/comp/Minimal";
import Portfolio from "@/components/comp/Portfolio";
import ProWarning from "@/components/proWarning";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasNoWallpaper } from "@/lib/wallpaper";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { CourseCard } from "@/components/CourceCard";
import WallpaperBackground from "@/components/WallpaperBackground";
import FooterSettingsPanel from "@/components/FooterSettingsPanel";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
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
    wallpaperEffects,
    activeSidebar,
    showUnsavedWarning,
    handleConfirmDiscardSidebar,
    handleCancelDiscardSidebar,
    isSwitchingSidebar,
    pendingSidebarAction,
  } = useGlobalContext();
  const { isClient } = useClient();
  const router = useRouter();
  const isMobile = useIsMobile();

  // Manage body margin-right based on active sidebar to prevent layout shift during switching (desktop only)
  useEffect(() => {
    // Only apply margin on desktop, not mobile
    if (isMobile) {
      return;
    }

    const body = document.body;
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    let marginWidth = '0px';
    if (activeSidebar === sidebars.work || activeSidebar === sidebars.review) {
      marginWidth = '500px';
    } else if (activeSidebar === sidebars.theme || activeSidebar === sidebars.footer) {
      marginWidth = '320px';
    }

    body.style.marginRight = marginWidth;

    return () => {
      body.style.marginRight = '0px';
      body.style.transition = '';
    };
  }, [activeSidebar, isMobile]);

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  // Restore wallpaper from userDetails when component mounts
  useEffect(() => {
    if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
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
      const hasExperienceLevel = userDetails.experienceLevel !== undefined && userDetails.experienceLevel !== null;
      const hasSkills = userDetails.skills && userDetails.skills.length > 0;
      const hasPersona = userDetails.persona && userDetails.persona.value && userDetails.persona.label;
      const needsOnboarding = !hasGoal || !hasExperienceLevel || !hasSkills || !hasPersona;

      if (needsOnboarding) {
        openModal(modals.onBoardingNewUser);
      } else {
        closeModal();
      }
    } else {
      closeModal();
    }
  }, [userDetails]);

  const modalContent = () => {
    switch (showModal) {
      case modals.onboarding:
        return <Onboarding />;
      case modals.onBoardingNewUser:
        return <OnboardingNewUser />;
      case modals.project:
        return <AddProject />;
      case modals.deleteProject:
        return <DeleteProject />;
      case modals.review:
        return null; // Review modal is handled by CustomSheet/Sheet in AddReview component
      case modals.tools:
        return <AddTools />;
      case modals.work:
        return null; // Work modal is handled by CustomSheet/Sheet in AddWork component
      case modals.resume:
        return <AddResume />;
      case modals.socialMedia:
        return <AddSocial />;
      case modals.portfolioLinks:
        return <AddPortfolioLinks />;
      case modals.username:
        return <AddUsername />;
    }
  };

  if (!userDetails?.emailVerification) {
    return <></>;
  }
  const renderTemplate = () => {
    switch (template) {
      case 0:
        return <Builder1 />;
      case 1:
        return <Builder2 edit />;
      case 2:
        return <Minimal userDetails={userDetails} edit />;
      case 3:
        return <Portfolio userDetails={userDetails} edit />;

      default:
        return <Builder1 />;
    }
  };

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className={cn(
        "min-h-screen", hasNoWallpaper(wallpaper) && "bg-df-bg-color")}>
        <div
          className={` mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0 ${userDetails?.template != 3 && "max-w-[890px]"
            }`}
        >
          {userDetails && !userDetails?.pro && <ProWarning />}
          {userDetails && (

            <>
              {isLoadingTemplate ? (
                <div className="flex items-center justify-center min-h-[calc(100vh-126px)]">
                  <Loader2 className="animate-spin h-8 w-8 text-df-orange-color" />
                </div>
              ) : (
                renderTemplate()
              )}
            </>
          )}
          {userDetails && taskPercentage !== 100 && <BottomTask />}
        </div>
        <Modal show={showModal && showModal !== modals.aiProject && showModal !== modals.review && showModal !== modals.work}>
          {modalContent()}
        </Modal>
        <Modal show={modals.aiProject == showModal} className={"md:block"}>
          <CreateAiProject openModal={openModal} />
        </Modal>
        <AddReview />
        <AddWork />
        {/* Unsaved changes dialog */}
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
        {isClient && userDetails && (
          <Feedefy
            projectId="a72769ea-5ab2-4ac9-81bd-1abe180d4b66"
            data-feedefy
            data-feedefy-userid={userDetails?.email}
          ></Feedefy>
        )}
        {!isMobile && <CourseCard />}
        <FooterSettingsPanel />
      </main>
    </>
  );
}
export { getServerSideProps };

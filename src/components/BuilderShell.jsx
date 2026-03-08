import Modal from '@/components/modal';
import { modals, sidebars } from '@/lib/constant';
import AddReview from '@/components/addReview';
import AddWork from '@/components/addWork';
import AddAbout from '@/components/addAbout';
import AddProject from '@/components/addProject';
import DeleteProject from '@/components/deleteProject';
import AddTools from '@/components/addTools';
import AddResume from '@/components/addResume';
import AddSocial from '@/components/addSocial';
import AddPortfolioLinks from '@/components/addPortfolioLinks';
import AddUsername from '@/components/addUsername';
import CreateAiProject from '@/components/createAiProject';
import Onboarding from '@/components/onboarding-old';
import OnboardingNewUser from '@/components/onboarding';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ReplacePortfolioDialog } from '@/components/ui/ReplacePortfolioDialog';
import FooterSettingsPanel from '@/components/FooterSettingsPanel';
import BottomTask from '@/components/bottomTask';
import ProWarning from '@/components/proWarning';
import { CourseCard } from '@/components/CourceCard';
import { Feedefy } from '@feedefy/react';
import { useGlobalContext } from '@/context/globalContext';
import useClient from '@/hooks/useClient';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * BuilderShell
 *
 * All the shared modals, sidebars, panels and overlays that must be present
 * on every authenticated editing page (builder + macOS project pages).
 *
 * Renders nothing visible on its own — it only mounts the portals/overlays.
 * Drop it anywhere inside a page that needs the full editing experience.
 */
export default function BuilderShell({ showProWarning = false }) {
  const {
    showModal,
    taskPercentage,
    userDetails,
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
  const isMobile = useIsMobile();

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
        return null;
      case modals.tools:
        return <AddTools />;
      case modals.work:
        return null;
      case modals.resume:
        return <AddResume />;
      case modals.socialMedia:
        return <AddSocial />;
      case modals.portfolioLinks:
        return <AddPortfolioLinks />;
      case modals.username:
        return <AddUsername />;
      case modals.about:
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      {showProWarning && userDetails && !userDetails?.pro && <ProWarning />}

      <Modal show={showModal && showModal !== modals.aiProject && showModal !== modals.review && showModal !== modals.work}>
        {modalContent()}
      </Modal>
      <Modal show={modals.aiProject === showModal} className="md:block">
        <CreateAiProject />
      </Modal>

      <AddReview />
      <AddWork />
      <AddAbout />

      <UnsavedChangesDialog
        open={showUnsavedWarning && isSwitchingSidebar && pendingSidebarAction?.type === 'open'}
        onOpenChange={(open) => { if (!open) handleCancelDiscardSidebar(); }}
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

      {userDetails && taskPercentage !== 100 && <BottomTask />}
      {!isMobile && <CourseCard />}
      <FooterSettingsPanel />
    </>
  );
}

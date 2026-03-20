import Modal from '@/components/modal';
import { modals } from '@/lib/constant';
import DeleteProject from '@/components/deleteProject';
import AddResume from '@/components/addResume';
import AddSocial from '@/components/addSocial';
import AddPortfolioLinks from '@/components/addPortfolioLinks';
import AddUsername from '@/components/addUsername';
import CreateAiProject from '@/components/createAiProject';
import Onboarding from '@/components/onboarding-old';
import OnboardingNewUser from '@/components/onboarding';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ReplacePortfolioDialog } from '@/components/ui/ReplacePortfolioDialog';
import { CourseCard } from '@/components/CourceCard';
import { Feedefy } from '@feedefy/react';
import { useGlobalContext } from '@/context/globalContext';
import useClient from '@/hooks/useClient';
import { useIsMobile } from '@/hooks/use-mobile';

export default function BuilderShell({ hideCourseCard = false }) {
  const {
    showModal,
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
      default:
        return null;
    }
  };

  return (
    <>
      <Modal show={showModal && showModal !== modals.aiProject && showModal !== modals.review && showModal !== modals.work && showModal !== modals.project}>
        {modalContent()}
      </Modal>
      <Modal show={modals.aiProject === showModal} className="md:block">
        <CreateAiProject />
      </Modal>

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

      {!isMobile && !hideCourseCard && <CourseCard />}
    </>
  );
}

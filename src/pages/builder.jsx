import React, { useEffect } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";
import Builder1 from "@/components/builder";
import BottomTask from "@/components/bottomTask";
import Modal from "@/components/modal";
import { modals } from "@/lib/constant";
import Onboarding from "@/components/onboarding";
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
  } = useGlobalContext();
  const { isClient } = useClient();
  const router = useRouter();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  useEffect(() => {
    // Check if userDetails.skills exists and its length is 0
    if (userDetails && !userDetails?.emailVerification) {
      _resendOTP().then(() => {
        router.push("/email-verify");
      });
    }
    if (userDetails && !userDetails?.username) {
      openModal(modals.username);
    } else if (userDetails && userDetails?.skills?.length === 0) {
      openModal(modals.onboarding);
    } else {
      closeModal();
    }
  }, [userDetails]);

  const modalContent = () => {
    switch (showModal) {
      case modals.onboarding:
        return <Onboarding />;
      case modals.project:
        return <AddProject />;
      case modals.deleteProject:
        return <DeleteProject />;
      case modals.review:
        return <AddReview />;
      case modals.tools:
        return <AddTools />;
      case modals.work:
        return <AddWork />;
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
    <main className="min-h-screen bg-df-bg-color">
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
      >
        {userDetails && renderTemplate()}
        {userDetails && taskPercentage !== 100 && <BottomTask />}
      </div>
      <Modal show={showModal && showModal != modals.aiProject}>
        {modalContent()}
      </Modal>
      <Modal show={modals.aiProject == showModal} className={"md:block"}>
        <CreateAiProject openModal={openModal} />
      </Modal>
      {isClient && userDetails && (
        <Feedefy
          projectId="a72769ea-5ab2-4ac9-81bd-1abe180d4b66"
          data-feedefy
          data-feedefy-userid={userDetails?.email}
        ></Feedefy>
      )}
    </main>
  );
}
export { getServerSideProps };

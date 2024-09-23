import React, { useEffect } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";
import Builder from "@/components/builder";
import BottomTask from "@/components/bottomTask";
import Modal from "@/components/modal";
import { modals } from "@/lib/constant";
import Onboarding from "@/components/onboarding";
import AddProject from "@/components/addProject";
import DeleteProject from "@/components/deleteProject";
import AddReview from "@/components/addReview";
import AddTools from "@/components/addTools";
import AddWork from "@/components/addWork";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    openModal,
    showModal,
    closeModal,
  } = useGlobalContext();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  useEffect(() => {
    // Check if userDetails.skills exists and its length is 0
    if (userDetails && !userDetails?.username) {
      openModal("email-verify");
    } else if (userDetails && userDetails?.skills?.length === 0) {
      openModal("onboarding");
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
    }
  };

  return (
    <main className="min-h-screen bg-df-bg-color">
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
      >
        {userDetails && <Builder />}
        <BottomTask />
      </div>
      <Modal show={showModal}>{modalContent()}</Modal>
    </main>
  );
}
export { getServerSideProps };

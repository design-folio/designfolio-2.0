import React, { useEffect } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";
import Builder from "@/components/builder";
import BottomTask from "@/components/bottomTask";
import Modal from "@/components/modal";
import { modals } from "@/lib/constant";
import Onboarding from "@/components/onboarding";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    showModal,
  } = useGlobalContext();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  const modalContent = () => {
    switch (showModal) {
      case modals.onboarding:
        return <Onboarding />;
    }
  };

  return (
    <main className="min-h-screen bg-df-bg">
      <div
        className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
      >
        {userDetails && <Builder />}
        <BottomTask />
      </div>
      <Modal show={true}>{modalContent()}</Modal>
    </main>
  );
}
export { getServerSideProps };

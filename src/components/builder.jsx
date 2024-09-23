import React from "react";
import Profile from "./profile";
import Projects from "./Projects";
import Reviews from "./reviews";
import { useGlobalContext } from "@/context/globalContext";
import Tools from "./tools";
import Works from "./works";
import Others from "./others";

export default function Builder() {
  const {
    projectRef,
    userDetails,
    setUserDetails,
    setSelectedProject,
    openModal,
    updateCache,
  } = useGlobalContext();

  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      <Profile edit userDetails={userDetails} openModal={openModal} />
      <Projects
        edit
        userDetails={userDetails}
        projectRef={projectRef}
        setUserDetails={setUserDetails}
        setSelectedProject={setSelectedProject}
        openModal={openModal}
      />
      <Reviews edit userDetails={userDetails} openModal={openModal} />
      <Tools userDetails={userDetails} openModal={openModal} edit />
      <Works
        edit
        openModal={openModal}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        updateCache={updateCache}
      />
      <Others edit openModal={openModal} userDetails={userDetails} />
    </div>
  );
}

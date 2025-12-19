import React from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import dynamic from "next/dynamic";
const ProjectEditor = dynamic(() => import("./projectEditor"), {
  ssr: false,
});
const TiptapEditor = dynamic(() => import("./tiptapEditor"), {
  ssr: false,
});

export default function Editor({ edit, projectDetails, refetchProjectDetail }) {
  const {
    userDetails,
    setUserDetails,
    setPopoverMenu,
    showModal,
    popoverMenu,
  } = useGlobalContext();

  return (
    <div className="editor-container flex-1 flex flex-col gap-3">
      {projectDetails && (
        <>
          <ProjectInfo
            projectDetails={projectDetails.project}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            showModal={showModal}
            edit={edit}
            setPopoverMenu={setPopoverMenu}
            popoverMenu={popoverMenu}
            refetchProjectDetail={refetchProjectDetail}
          />
          {projectDetails.project.contentVersion === 2 ? (
            <TiptapEditor
              projectDetails={projectDetails.project}
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              refetchProjectDetail={refetchProjectDetail}
            />
          ) : (
            <ProjectEditor
              projectDetails={projectDetails.project}
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              refetchProjectDetail={refetchProjectDetail}
            />
          )}
        </>
      )}
    </div>
  );
}

import React from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import BlockRenderer from "./blockRenderer";

export default function ProjectPreview({ projectDetails }) {
  const { userDetails, showModal } = useGlobalContext();
  console.log(projectDetails);

  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      {projectDetails && (
        <>
          <ProjectInfo
            projectDetails={projectDetails?.project}
            userDetails={userDetails}
            showModal={showModal}
          />
          {!!projectDetails?.project?.content && (
            <BlockRenderer editorJsData={projectDetails?.project?.content} />
          )}
        </>
      )}
    </div>
  );
}

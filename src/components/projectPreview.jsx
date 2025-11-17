import React from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import BlockRenderer from "./blockRenderer";
import TiptapRenderer from "./tiptapRenderer";

export default function ProjectPreview({ projectDetails }) {
  const { userDetails, showModal } = useGlobalContext();
  console.log(projectDetails);

  const contentVersion = projectDetails?.project?.contentVersion || 1;
  const hasTiptapContent = contentVersion === 2 && projectDetails?.project?.tiptapContent;
  const hasEditorJSContent = contentVersion === 1 && projectDetails?.project?.content;

  return (
    <div className="flex-1 flex flex-col gap-3">
      {projectDetails && (
        <>
          <ProjectInfo
            projectDetails={projectDetails?.project}
            userDetails={userDetails}
            showModal={showModal}
          />
          {hasTiptapContent && (
            <TiptapRenderer content={projectDetails?.project?.tiptapContent} />
          )}
          {hasEditorJSContent && (
            <BlockRenderer editorJsData={projectDetails?.project?.content} />
          )}
        </>
      )}
    </div>
  );
}

import BlockRenderer from "./blockRenderer";
import TiptapRenderer from "./tiptapRenderer";
import ProjectInfo from "./projectInfo";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ProjectRenderer({ projectDetails }) {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    if (projectDetails?.projects?.theme) {
      setTheme(projectDetails?.projects?.theme == 1 ? "dark" : "light");
    }
  }, [projectDetails]);
  
  return (
    <div className="flex-1 flex flex-col gap-3">
      {projectDetails && (
        <>
          <ProjectInfo projectDetails={projectDetails?.project} />
          {projectDetails?.project?.contentVersion === 2 && projectDetails?.project?.tiptapContent ? (
            <TiptapRenderer content={projectDetails?.project?.tiptapContent} />
          ) : !!projectDetails?.project?.content ? (
            <BlockRenderer editorJsData={projectDetails?.project?.content} />
          ) : null}
        </>
      )}
    </div>
  );
}

import { useRouter } from "next/router";
import BlockRenderer from "./blockRenderer";
import { _getProjectDetails } from "@/network/get-request";
import ProjectInfo from "./projectInfo";

export default function ProjectRenderer({ projectDetails }) {
  const router = useRouter();

  useEffect(() => {
    if (projectDetails?.projects?.theme) {
      setTheme(projectDetails?.projects?.theme == 1 ? "dark" : "light");
    }
  }, [projectDetails]);
  return (
    <div className="flex-1 flex flex-col gap-4 md:gap-6">
      {projectDetails && (
        <>
          <ProjectInfo projectDetails={projectDetails?.project} />
          {!!projectDetails?.project?.content && (
            <BlockRenderer editorJsData={projectDetails?.project?.content} />
          )}
        </>
      )}
    </div>
  );
}

import BlockRenderer from "./blockRenderer";
import ProjectInfo from "./projectInfo";

export default function ProjectRenderer({ projectDetails }) {
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

import React, { useEffect } from "react";
import ProjectInfo from "./projectInfo";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import BlockRenderer from "./blockRenderer";

export default function ProjectPreview() {
  const router = useRouter();

  const { userDetails, showModal } = useGlobalContext();

  const { data: projectDetails } = useQuery({
    queryKey: [`project-preview-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  useEffect(() => {
    if (projectDetails?.projects?.theme) {
      setTheme(projectDetails?.projects?.theme == 1 ? "dark" : "light");
    }
  }, [projectDetails]);
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

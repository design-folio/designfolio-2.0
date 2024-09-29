import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const ProjectEditor = dynamic(() => import("./projectEditor"), {
  ssr: false,
});

export default function Editor({ edit }) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const { userDetails, setUserDetails, setShowModal, showModal } =
    useGlobalContext();

  const { data: projectDetails, refetch: refetchProjectDetail } = useQuery({
    queryKey: [`project-editor-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  useEffect(() => {
    if (userDetails?.theme) {
      setTheme(userDetails?.theme == 1 ? "dark" : "light");
    }
  }, [userDetails]);
  return (
    <div className="editor-container flex-1 flex flex-col gap-4 md:gap-6">
      {projectDetails && (
        <>
          <ProjectInfo
            projectDetails={projectDetails.project}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            showModal={showModal}
            edit={edit}
          />
          <ProjectEditor
            projectDetails={projectDetails.project}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            refetchProjectDetail={refetchProjectDetail}
          />
        </>
      )}
    </div>
  );
}

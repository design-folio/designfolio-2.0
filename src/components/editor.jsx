import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";

export default function Editor({ edit }) {
  const router = useRouter();

  const { userDetails, setUserDetails, setShowModal, showModal } =
    useGlobalContext();

  const {
    data: projectDetails,
    isLoading,
    error,
    isStale,
    refetch,
  } = useQuery({
    queryKey: [`project-editor-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  return (
    <div>
      {projectDetails && (
        <ProjectInfo
          projectDetails={projectDetails.project}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          setShowModal={setShowModal}
          showModal={showModal}
          edit={edit}
        />
      )}
    </div>
  );
}

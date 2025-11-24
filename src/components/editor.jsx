import { _getProjectDetails } from "@/network/get-request";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const ProjectEditor = dynamic(() => import("./projectEditor"), {
  ssr: false,
});
const TiptapEditor = dynamic(() => import("./tiptapEditor"), {
  ssr: false,
});

export default function Editor({ edit }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [projectDetails, setProjectDetails] = useState(null);
  const { setCursor } = useGlobalContext();

  const {
    userDetails,
    setUserDetails,
    setPopoverMenu,
    showModal,
    popoverMenu,
  } = useGlobalContext();

  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    onSuccess: (data) => {
      setProjectDetails(data);
      setCursor(data?.project?.cursor ? data?.project?.cursor : 0);
      setTheme(data?.project?.theme == 1 ? "dark" : "light");
      setIsProtected(data?.isProtected);
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  useEffect(() => {
    refetchProjectDetail();
  }, []);

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

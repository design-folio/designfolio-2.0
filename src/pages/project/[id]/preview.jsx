import ProjectPassword from "@/components/projectPassword";
import ProjectPreview from "@/components/projectPreview";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Index() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const [projectDetails, setProjectDetails] = useState(null);
  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      setProjectDetails(data);
      setTheme(data?.project?.theme == 1 ? "dark" : "light");
      setIsProtected(data?.isProtected);
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  useEffect(() => {
    refetchProjectDetail();
  }, [refetchProjectDetail]);

  const [isProtected, setIsProtected] = useState(projectDetails?.isProtected);

  const updateProjectCache = (data) => {
    queryClient.setQueriesData(
      { queryKey: [`project-editor-${router.query.id}`] },
      (oldData) => {
        return {
          ...oldData,
          ...data,
        };
      }
    );
  };

  return (
    <main className="min-h-screen bg-df-bg-color">
      {projectDetails && (
        <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
          {isProtected ? (
            <ProjectPassword
              status={0}
              projectDetails={projectDetails?.project}
              id={router.query.id}
              updateProjectCache={updateProjectCache}
              setIsProtected={setIsProtected}
            />
          ) : (
            <ProjectPreview projectDetails={projectDetails} />
          )}
        </div>
      )}
    </main>
  );
}

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  if (!dfToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: { dfToken: !!dfToken, hideHeader: true },
  };
};

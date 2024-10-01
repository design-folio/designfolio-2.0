import ProjectPreview from "@/components/projectPreview";
import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Index() {
  const { setTheme } = useTheme();
  const router = useRouter();

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
    <main className="min-h-screen bg-df-bg-color">
      {projectDetails && (
        <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
          {projectDetails?.isProtected ? (
            <></>
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

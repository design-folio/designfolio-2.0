import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Index({ data }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: projectDetails } = useQuery({
    queryKey: [`project-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    initialData: data,
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
      <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
        <div className="flex-1 flex flex-col gap-4 md:gap-6">
          {projectDetails && (
            <>
              <ProjectInfo projectDetails={projectDetails?.project} />
              {!!projectDetails?.project?.content && (
                <BlockRenderer
                  editorJsData={projectDetails?.project?.content}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  try {
    const projectDetails = await _getProjectDetails(id, 1);

    if (projectDetails) {
      return {
        props: {
          data: projectDetails?.data,
          hideHeader: true,
        },
      };
    } else {
      // If no user is found, redirect or handle accordingly
      return {
        redirect: {
          destination: "https://designfolio.me",
          permanent: false,
        },
      };
    }
  } catch (error) {
    // Handle the error or redirect if necessary
    return {
      redirect: {
        destination: "https://designfolio.me",
        permanent: false,
      },
    };
  }
}

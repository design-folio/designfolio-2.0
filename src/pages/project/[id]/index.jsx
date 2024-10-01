import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import ProjectPassword from "@/components/projectPassword";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Index({ data }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isProtected, setIsProtected] = useState(data.isProtected);
  const { data: projectDetails } = useQuery({
    queryKey: [`project-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 1); // Adjust the endpoint
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

  const updateProjectCache = (data) => {
    setIsProtected(false);
    queryClient.setQueriesData(
      { queryKey: [`project-${router.query.id}`] },
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
      <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
        <div className="flex-1 flex flex-col gap-4 md:gap-6">
          {projectDetails && (
            <>
              {isProtected ? (
                <ProjectPassword
                  status={1}
                  projectDetails={projectDetails?.project}
                  id={router.query.id}
                  updateProjectCache={updateProjectCache}
                />
              ) : (
                <>
                  <ProjectInfo projectDetails={projectDetails?.project} />
                  {!!projectDetails?.project?.content && (
                    <BlockRenderer
                      editorJsData={projectDetails?.project?.content}
                    />
                  )}
                </>
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

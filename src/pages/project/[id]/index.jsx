import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import ProjectPassword from "@/components/projectPassword";
import Seo from "@/components/seo";
import { useGlobalContext } from "@/context/globalContext";
import { capitalizeWords } from "@/lib/capitalizeText";
import { _getProjectDetails } from "@/network/get-request";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import MadeWithDesignfolio from "../../../../public/assets/svgs/madewithdesignfolio.svg";

export default function Index({ data }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { setCursor } = useGlobalContext();
  const [isProtected, setIsProtected] = useState(data.isProtected);
  const [projectDetails, setProjectDetails] = useState(null);

  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 1); // Adjust the endpoint
      return response.data;
    },
    onSuccess: (data) => {
      setProjectDetails(data);
      setCursor(data?.project?.cursor ? data?.project?.cursor : 0);
      setTheme(data?.project?.theme == 1 ? "dark" : "light");
      setIsProtected(data?.isProtected);
    },
    initialData: data,
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });

  useEffect(() => {
    refetchProjectDetail();
  }, [refetchProjectDetail]);

  return (
    <>
      <Seo
        title={capitalizeWords(data?.project?.title)}
        description={data?.project?.description}
        keywords={data?.project?.description}
        imageUrl={
          data?.project?.thumbnail?.key ?? "/assets/png/seo-profile.png"
        }
        url={`https://${data?.project?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <main className="min-h-screen bg-df-bg-color">
        <div
          className={`max-w-[890px] mx-auto pt-[16px] pb-[80px] lg:py-[40px] px-2 md:px-4 lg:px-0`}
        >
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            {projectDetails && (
              <>
                {isProtected ? (
                  <ProjectPassword
                    status={1}
                    projectDetails={projectDetails?.project}
                    id={router.query.id}
                    setIsProtected={setIsProtected}
                    setProjectDetails={setProjectDetails}
                  />
                ) : (
                  <>
                    <ProjectInfo projectDetails={projectDetails?.project} />
                    {projectDetails?.project?.content && (
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
        {!data?.project?.pro && (
          <div
            className={`text-center flex justify-center fixed bottom-0 right-0 left-0 lg:left-[unset] lg:right-[36px] lg:bottom-[10px] mb-2 xl:block cursor-pointer`}
            onClick={() => window.open("https://www.designfolio.me", "_blank")}
          >
            <div className="bg-df-section-card-bg-color shadow-lg p-2 rounded-2xl">
              <MadeWithDesignfolio className="text-df-icon-color" />
            </div>
          </div>
        )}
      </main>
    </>
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

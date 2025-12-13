import ProjectPassword from "@/components/projectPassword";
import ProjectPreview from "@/components/projectPreview";
import { useGlobalContext } from "@/context/globalContext";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Index() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { setCursor } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0); // Adjust the endpoint
      return response.data;
    },
    onSuccess: (data) => {
      setProjectDetails(data);
      setCursor(data?.project?.cursor ? data?.project?.theme : 0);
      setTheme(data?.project?.theme == 1 ? "dark" : "light");
      setIsProtected(data?.isProtected);
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });
  useEffect(() => {
    refetchProjectDetail();
  }, [refetchProjectDetail]);

  return (
    <main className="min-h-screen">
      {projectDetails && (
        <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
          <ProjectPreview projectDetails={projectDetails} />
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

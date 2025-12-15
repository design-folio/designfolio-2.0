import ProjectPassword from "@/components/projectPassword";
import ProjectPreview from "@/components/projectPreview";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getWallpaperUrl } from "@/lib/wallpaper";

export default function Index() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { setCursor } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const [isProtected, setIsProtected] = useState(false);

  const wp = projectDetails?.project?.wallpaper;
  const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
  const wallpaperUrl = (wpValue !== undefined && wpValue !== null && wpValue !== 0)
    ? getWallpaperUrl(wpValue, resolvedTheme || theme)
    : null;

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
    <>
      {wallpaperUrl && (
        <div
          suppressHydrationWarning
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${wallpaperUrl})`,
            pointerEvents: 'none'
          }}
        />
      )}
      <main className={cn(
        "min-h-screen",
        wallpaperUrl ? "bg-transparent" : "bg-df-bg-color"
      )}>
        {projectDetails && (
          <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
            <ProjectPreview projectDetails={projectDetails} />
          </div>
        )}
      </main>
    </>
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

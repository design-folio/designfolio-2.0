import Editor from "@/components/editor";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

export default function Index() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { userDetails, setCursor, setWallpaper, wallpaperUrl } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);

  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0);
      return response.data;
    },
    onSuccess: (data) => {
      setProjectDetails(data);
      setCursor(data?.project?.cursor ? data?.project?.cursor : 0);
      setTheme(data?.project?.theme == 1 ? "dark" : "light");
      setWallpaper(data?.project?.wallpaper);
    },
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });

  useEffect(() => {
    if (router.query.id) {
      refetchProjectDetail();
    }
  }, [router.query.id]);

  return (
    <>
      {wallpaperUrl && (
        <div
          className="wallpaper-transition"
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
      )}>
        <div
          className={`max-w-[890px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0`}
        >
          <Editor
            edit
            projectDetails={projectDetails}
            refetchProjectDetail={refetchProjectDetail}
          />
        </div>
      </main>
    </>
  );
}

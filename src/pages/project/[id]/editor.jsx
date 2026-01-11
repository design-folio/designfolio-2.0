import Editor from "@/components/editor";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebars } from "@/lib/constant";

export default function Index() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { userDetails, setCursor, setWallpaper, wallpaperUrl, activeSidebar } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const initializedRef = useRef(false);
  const isMobile = useIsMobile();

  const setProjectData = (project, isFromRefetch = false) => {
    setProjectDetails({ project: project });

    if (isFromRefetch) {
      setTheme(project?.theme == 1 ? "dark" : "light");
      setWallpaper(project?.wallpaper);
    } else {
      if (project?.theme !== undefined) {
        setTheme(project.theme == 1 ? "dark" : "light");
      } else if (userDetails?.theme !== undefined) {
        setTheme(userDetails.theme == 1 ? "dark" : "light");
      }

      if (project?.wallpaper !== undefined) {
        setWallpaper(project.wallpaper);
      } else if (userDetails?.wallpaper !== undefined) {
        setWallpaper(userDetails.wallpaper);
      }
    }

    const cursor = project?.cursor != null
      ? project.cursor
      : (project?.theme != null ? project.theme : (userDetails?.cursor || 0));
    setCursor(cursor);
  };

  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0);
      return response.data;
    },
    onSuccess: (data) => {
      setProjectData(data?.project, true);
    },
    cacheTime: 300000,
    staleTime: 60000,
  });

  useEffect(() => {
    const projectId = router.query.id;
    if (!projectId) return;

    if (initializedRef.current && initializedRef.current !== projectId) {
      initializedRef.current = false;
    }

    if (initializedRef.current) return;

    const cachedProject = userDetails?.projects?.find(
      (project) => project._id === projectId
    );

    if (cachedProject) {
      setProjectData(cachedProject);
      initializedRef.current = projectId;
    } else {
      refetchProjectDetail();
      initializedRef.current = projectId;
    }
  }, [router.query.id, userDetails?.projects, refetchProjectDetail]);

  // Manage body margin-right based on active sidebar to prevent layout shift during switching (desktop only)
  useEffect(() => {
    // Only apply margin on desktop, not mobile
    if (isMobile) {
      return;
    }

    const body = document.body;
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    let marginWidth = '0px';
    if (activeSidebar === sidebars.work || activeSidebar === sidebars.review) {
      marginWidth = '500px';
    } else if (activeSidebar === sidebars.theme) {
      marginWidth = '320px';
    }

    body.style.marginRight = marginWidth;

    return () => {
      body.style.marginRight = '0px';
      body.style.transition = '';
    };
  }, [activeSidebar, isMobile]);

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} />
      <main className={cn("min-h-screen")}>
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

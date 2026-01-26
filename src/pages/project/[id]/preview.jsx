import ProjectPassword from "@/components/projectPassword";
import ProjectPreview from "@/components/projectPreview";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";

export default function Index() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { setCursor, setWallpaper, wallpaperUrl, userDetails, wallpaperEffects } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const initializedRef = useRef(false);

  const setProjectData = (project, isProtectedValue = false, isFromRefetch = false) => {
    setProjectDetails({
      project: project,
      isProtected: isProtectedValue,
    });

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
    setIsProtected(isProtectedValue);
  };

  const { mutate: refetchProjectDetail } = useMutation({
    mutationKey: [`project-editor-${router.query.id}`],
    mutationFn: async () => {
      const response = await _getProjectDetails(router.query.id, 0);
      return response.data;
    },
    onSuccess: (data) => {
      setProjectData(data?.project, data?.isProtected, true);
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
      setProjectData(cachedProject, cachedProject.protected || false);
      initializedRef.current = projectId;
    } else {
      refetchProjectDetail();
      initializedRef.current = projectId;
    }
  }, [router.query.id, userDetails?.projects, refetchProjectDetail]);

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className={cn("min-h-screen")}>
        {projectDetails && (
          <div className={`max-w-[848px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
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

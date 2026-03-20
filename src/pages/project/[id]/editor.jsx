import Editor from "@/components/editor";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useGlobalContext } from "@/context/globalContext";
import { TEMPLATE_IDS } from "@/lib/templates";
import { getProjectUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import { _updateProject, _updateUser } from "@/network/post-request";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { modals } from "@/lib/constant";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarShiftWidth } from "@/lib/constant";
import MacOSWindowShell from "@/components/templates/MacOSDock/MacOSWindowShell";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import BuilderShell from "@/components/BuilderShell";

export default function Index() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const {
    userDetails,
    userDetailLoading,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    setCursor,
    setWallpaper,
    wallpaperUrl,
    activeSidebar,
    wallpaperEffects,
    openModal,
    setSelectedProject,
    setUserDetails,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
    domainDetails,
    closeSidebar,
  } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const initializedRef = useRef(false);
  const lastSidebarRef = useRef(null);
  if (activeSidebar) lastSidebarRef.current = activeSidebar;
  const isMobile = useIsMobile();

  // Enable the userDetails query — required on every authenticated page
  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

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

    const cursor =
      project?.cursor != null
        ? project.cursor
        : project?.theme != null
          ? project.theme
          : userDetails?.cursor || 0;
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
    if (!projectId || !userDetails) return;

    if (initializedRef.current && initializedRef.current !== projectId) {
      initializedRef.current = false;
    }

    if (initializedRef.current) return;

    const cachedProject = userDetails.projects?.find(
      (project) => project._id === projectId,
    );

    if (cachedProject) {
      setProjectData(cachedProject);
      initializedRef.current = projectId;
    } else {
      refetchProjectDetail();
      initializedRef.current = projectId;
    }
  }, [router.query.id, userDetails, refetchProjectDetail]);

  // Compensate for scrollbar gutter when sidebar opens so content doesn't shift.
  useEffect(() => {
    if (activeSidebar && !isMobile) {
      const el = document.documentElement;
      const scrollbarWidth = window.innerWidth - el.clientWidth;
      el.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
    } else {
      document.documentElement.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.paddingRight = "";
    };
  }, [activeSidebar, isMobile]);

  // Wait for userDetails to load before rendering — prevents a flash of the
  // wrong layout on refresh (before userDetails.template is known).
  if (!userDetails && userDetailLoading) {
    return (
      <>
        <WallpaperBackground
          wallpaperUrl={wallpaperUrl}
          effects={wallpaperEffects}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!userDetails) return null;

  const template = userDetails.template;
  const isMacOS = template === TEMPLATE_IDS.RETRO_OS;
  const isEmbed = router.query.embed === "1";

  const sidebarProviderProps = {
    open: !!activeSidebar,
    onOpenChange: (open) => !open && closeSidebar(true),
    style: {
      "--sidebar-width": getSidebarShiftWidth(lastSidebarRef.current) || "400px",
    },
    defaultOpen: false,
  };
  const projectTitle = projectDetails?.project?.title || "Project";
  const currentProject = projectDetails?.project;

  const projectContainerClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "max-w-[640px] mx-auto flex flex-col gap-3 pb-20 pt-24 px-4 md:px-0";
      case TEMPLATE_IDS.MONO:
        return "max-w-[640px] mx-auto pb-20 pt-[80px] custom-dashed-x bg-[#F0EDE7] dark:bg-[#1A1A1A] min-h-screen";
      case TEMPLATE_IDS.RETRO_OS:
        return "max-w-[848px] mx-auto py-6 px-2 md:px-4 lg:px-0";
      default:
        return "max-w-[848px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0";
    }
  })();

  const editorContent = (
    <div className={projectContainerClass}>
      <Editor
        edit
        projectDetails={projectDetails}
        refetchProjectDetail={refetchProjectDetail}
      />
    </div>
  );

  const handleDeleteProject = () => {
    if (!currentProject) return;
    openModal(modals.deleteProject);
    setSelectedProject(currentProject);
  };

  const handleToggleVisibility = () => {
    if (!currentProject || !userDetails) return;
    const projectId = currentProject._id;
    const projects = userDetails.projects || [];
    const existing = projects.find((p) => p._id === projectId);
    if (!existing) return;

    const visibleCount = projects.filter((p) => !p.hidden).length;
    const isUnhiding = existing.hidden === true;

    // Free-tier 2-project visibility limit currently disabled, but keep logic for future use
    if (false && !userDetails.pro && isUnhiding && visibleCount >= 2) {
      setUpgradeModalUnhideProject({
        projectId,
        title: existing.title || "Project",
      });
      setShowUpgradeModal(true);
      return;
    }

    const updatedProjects = projects.map((p) =>
      p._id === projectId ? { ...p, hidden: !p.hidden } : p,
    );

    setUserDetails((prev) =>
      prev ? { ...prev, projects: updatedProjects } : prev,
    );
    _updateProject(projectId, { hidden: !existing.hidden });
    _updateUser({ projects: updatedProjects });

    setProjectDetails((prev) =>
      prev
        ? { project: { ...prev.project, hidden: !prev.project.hidden } }
        : prev,
    );
  };

  // Embed mode: only render editor content (no shell, no background)
  if (isEmbed) {
    return (
      <div className="min-h-full bg-white overflow-auto">{editorContent}</div>
    );
  }

  return (
    <SidebarProvider {...sidebarProviderProps}>
      <div className="flex-1 min-w-0">
        <WallpaperBackground
          wallpaperUrl={wallpaperUrl}
          effects={wallpaperEffects}
        />

        {isMacOS ? (
          <>
            {/* Full macOS desktop as background — menu bar, dock, widgets */}
            <MacOSTemplate userDetails={userDetails} edit />
            {/* Project window floats on top as a fixed overlay */}
            <MacOSWindowShell
              title={projectTitle}
              projectUrl={getProjectUrl({
                username: userDetails?.username,
                baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
                customDomain: domainDetails?.customDomain?.domain,
                isCustomVerified: domainDetails?.customDomain?.isCustomVerified,
                projectId: router.query.id,
              })}
              tabs={[
                { label: "Preview", href: `/project/${router.query.id}/preview` },
                { label: "Editor", href: `/project/${router.query.id}/editor` },
              ]}
              activeTab="Editor"
              canManage={!!currentProject}
              isHidden={!!currentProject?.hidden}
              hasPassword={!!currentProject?.protected}
              projectId={currentProject?._id}
              initialPassword={currentProject?.password || ""}
              onDelete={handleDeleteProject}
              onToggleVisibility={handleToggleVisibility}
            >
              {editorContent}
            </MacOSWindowShell>
            {/* All modals, dialogs — same as builder page */}
            <BuilderShell />
          </>
        ) : (
          <main className={cn("min-h-screen")}>{editorContent}</main>
        )}
      </div>
      <AppSidebar />
    </SidebarProvider>
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
  const isEmbed = context.query.embed === "1";
  return {
    props: { dfToken: !!dfToken, ...(isEmbed && { hideHeader: true }) },
  };
};

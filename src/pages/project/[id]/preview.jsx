import ProjectPassword from "@/components/projectPassword";
import ProjectPreview from "@/components/projectPreview";
import WallpaperBackground from "@/components/WallpaperBackground";
import { TEMPLATE_IDS } from "@/lib/templates";
import { useGlobalContext } from "@/context/globalContext";
import { getProjectUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { _getProjectDetails } from "@/network/get-request";
import { _updateProject, _updateUser } from "@/network/post-request";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import MacOSWindowShell from "@/components/templates/MacOSDock/MacOSWindowShell";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import BuilderShell from "@/components/BuilderShell";
import ProfessionalProjectInfo from "@/components/templates/Professional/ProfessionalProjectInfo";
import ChatProjectView from "@/components/templates/Chat/ChatProjectView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { modals } from "@/lib/constant";

export default function Index() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const {
    setCursor,
    setWallpaper,
    wallpaperUrl,
    userDetails,
    userDetailLoading,
    userDetailsIsState,
    setIsUserDetailsFromCache,
    wallpaperEffects,
    openModal,
    setSelectedProject,
    setUserDetails,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
    domainDetails,
  } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const initializedRef = useRef(false);

  // Enable the userDetails query — required on every authenticated page
  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  const setProjectData = (
    project,
    isProtectedValue = false,
    isFromRefetch = false,
  ) => {
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

    const cursor =
      project?.cursor != null
        ? project.cursor
        : project?.theme != null
          ? project.theme
          : userDetails?.cursor || 0;
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
    if (!projectId || !userDetails) return;

    if (initializedRef.current && initializedRef.current !== projectId) {
      initializedRef.current = false;
    }

    if (initializedRef.current) return;

    const cachedProject = userDetails.projects?.find(
      (project) => project._id === projectId,
    );

    if (cachedProject) {
      setProjectData(cachedProject, cachedProject.protected || false);
      initializedRef.current = projectId;
    } else {
      refetchProjectDetail();
      initializedRef.current = projectId;
    }
  }, [router.query.id, userDetails, refetchProjectDetail]);

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
  const isProfessional = template === TEMPLATE_IDS.PROFESSIONAL;
  const isChatfolio = template === TEMPLATE_IDS.CHATFOLIO;
  const projectTitle = projectDetails?.project?.title || "Project";
  const currentProject = projectDetails?.project;

  const projectContainerClass = (() => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return "max-w-[640px] mx-auto flex flex-col gap-3 pb-20 pt-[40px] px-4 md:px-0";
      case TEMPLATE_IDS.MONO:
        return "max-w-[640px] mx-auto pb-20 custom-dashed-x bg-[#F0EDE7] dark:bg-[#1A1A1A] min-h-screen";
      case TEMPLATE_IDS.RETRO_OS:
        return "max-w-[848px] mx-auto py-6 px-2 md:px-4 lg:px-0";
      case TEMPLATE_IDS.PROFESSIONAL:
        return "max-w-[848px] mx-auto px-2 md:px-4 lg:px-0";
      default:
        return "max-w-[848px] mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0";
    }
  })();

  const previewContent = projectDetails && (
    <div className={projectContainerClass}>
      <ProjectPreview projectDetails={projectDetails} />
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
        ? {
          ...prev,
          project: { ...prev.project, hidden: !prev.project.hidden },
        }
        : prev,
    );
  };

  return (
    <>
      <WallpaperBackground
        wallpaperUrl={wallpaperUrl}
        effects={wallpaperEffects}
      />

      {isChatfolio && currentProject ? (
        <>
          <ChatProjectView
            project={currentProject}
            ownerUser={userDetails}
            onBack={() => router.push("/portfolio-preview")}
          />
          <BuilderShell hideCourseCard />
        </>
      ) : isProfessional && currentProject ? (
        <>
          <ProfessionalProjectInfo projectDetails={currentProject} userDetails={userDetails} />
          <BuilderShell hideCourseCard />
        </>
      ) : isMacOS ? (
        <>
          {/* Full macOS desktop as background — menu bar, dock, widgets */}
          <MacOSTemplate userDetails={userDetails} edit noTopNavbar />
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
            activeTab="Preview"
            isHidden={!!currentProject?.hidden}
            hasPassword={!!currentProject?.protected}
            projectId={currentProject?._id}
            initialPassword={currentProject?.password || ""}
            onDelete={handleDeleteProject}
            onToggleVisibility={handleToggleVisibility}
          >
            {previewContent}
          </MacOSWindowShell>
          {/* All modals, sidebars, panels — same as builder page */}
          <BuilderShell hideCourseCard />
        </>
      ) : (
        <main className={cn("min-h-screen")}>
          <div className="fixed top-4 left-4 z-50">
            {
              !template === TEMPLATE_IDS.MONO && (<Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="rounded-full shadow-md bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#2A2520]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Preview
              </Button>)
            }
          </div>
          {previewContent}
        </main>
      )}
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

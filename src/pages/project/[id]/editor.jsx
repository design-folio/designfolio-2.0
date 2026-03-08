import Editor from '@/components/editor';
import WallpaperBackground from '@/components/WallpaperBackground';
import { useGlobalContext } from '@/context/globalContext';
import { getProjectUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { _getProjectDetails } from '@/network/get-request';
import { _updateProject, _updateUser } from '@/network/post-request';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { modals, sidebars } from '@/lib/constant';
import MacOSWindowShell from '@/components/MacOSDock/MacOSWindowShell';
import MacOSTemplate from '@/components/comp/MacOSTemplate';
import BuilderShell from '@/components/BuilderShell';

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
  } = useGlobalContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const initializedRef = useRef(false);
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
      setTheme(project?.theme == 1 ? 'dark' : 'light');
      setWallpaper(project?.wallpaper);
    } else {
      if (project?.theme !== undefined) {
        setTheme(project.theme == 1 ? 'dark' : 'light');
      } else if (userDetails?.theme !== undefined) {
        setTheme(userDetails.theme == 1 ? 'dark' : 'light');
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
    onSuccess: data => {
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
      project => project._id === projectId
    );

    if (cachedProject) {
      setProjectData(cachedProject);
      initializedRef.current = projectId;
    } else {
      refetchProjectDetail();
      initializedRef.current = projectId;
    }
  }, [router.query.id, userDetails, refetchProjectDetail]);

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

  // Wait for userDetails to load before rendering — prevents a flash of the
  // wrong layout on refresh (before userDetails.template is known).
  if (!userDetails && userDetailLoading) {
    return (
      <>
        <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!userDetails) return null;

  const isMacOS = userDetails.template === 4;
  const projectTitle = projectDetails?.project?.title || 'Project';
  const currentProject = projectDetails?.project;

  const editorContent = (
    <div className={`max-w-[848px] mx-auto ${isMacOS ? 'py-6' : 'py-[94px] md:py-[124px]'} px-2 md:px-4 lg:px-0`}>
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
      setUpgradeModalUnhideProject({ projectId, title: existing.title || 'Project' });
      setShowUpgradeModal(true);
      return;
    }

    const updatedProjects = projects.map((p) =>
      p._id === projectId ? { ...p, hidden: !p.hidden } : p
    );

    setUserDetails((prev) => (prev ? { ...prev, projects: updatedProjects } : prev));
    _updateProject(projectId, { hidden: !existing.hidden });
    _updateUser({ projects: updatedProjects });

    setProjectDetails((prev) =>
      prev ? { project: { ...prev.project, hidden: !prev.project.hidden } } : prev
    );
  };

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />

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
              { label: 'Preview', href: `/project/${router.query.id}/preview` },
              { label: 'Editor', href: `/project/${router.query.id}/editor` },
            ]}
            activeTab="Editor"
            canManage={!!currentProject}
            isHidden={!!currentProject?.hidden}
            hasPassword={!!currentProject?.protected}
            projectId={currentProject?._id}
            initialPassword={currentProject?.password || ''}
            onDelete={handleDeleteProject}
            onToggleVisibility={handleToggleVisibility}
          >
            {editorContent}
          </MacOSWindowShell>
          {/* All modals, sidebars, panels — same as builder page */}
          <BuilderShell />
        </>
      ) : (
        <main className={cn('min-h-screen')}>
          {editorContent}
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
    props: { dfToken: !!dfToken },
  };
};

import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import ProjectPassword from "@/components/projectPassword";
import Seo from "@/components/seo";
import TiptapRenderer from "@/components/tiptapRenderer";
import { useGlobalContext } from "@/context/globalContext";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { capitalizeWords } from "@/lib/capitalizeText";
import { _getProjectDetails } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import MadeWithDesignfolio from "../../../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import { getWallpaperUrl } from "@/lib/wallpaper";

export default function Index({ data }) {
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { setCursor, setWallpaper, userDetails, wallpaperEffects } = useGlobalContext();
  const [unlockedProjectData, setUnlockedProjectData] = useState(null);

  // Try to get project from context first (fastest)
  const contextProject = useMemo(() => {
    if (!router.query.id || !userDetails?.projects) return null;
    return userDetails.projects.find(
      (project) => project._id === router.query.id
    );
  }, [router.query.id, userDetails?.projects]);

  const shouldFetch = router.isReady &&
    !!router.query.id &&
    userDetails !== null && // Context has been checked
    !contextProject; // Project not in context

  const { data: fetchedData } = useQuery({
    queryKey: [`project-${router.query.id}`],
    queryFn: async () => {
      const response = await _getProjectDetails(router.query.id, 1);
      return response.data;
    },
    enabled: shouldFetch, 
    placeholderData: data, 
    cacheTime: 300000,
    staleTime: 60000,
  });

  const projectData = useMemo(() => {
    if (unlockedProjectData) {
      return {
        project: unlockedProjectData?.project,
        isProtected: unlockedProjectData?.isProtected || false,
      };
    }
    if (contextProject) {
      return {
        project: contextProject,
        isProtected: contextProject.protected || false,
      };
    }
    if (fetchedData) {
      return {
        project: fetchedData?.project,
        isProtected: fetchedData?.isProtected || false,
      };
    }
    if (data) {
      return {
        project: data?.project,
        isProtected: data?.isProtected || false,
      };
    }
    return null;
  }, [unlockedProjectData, contextProject, fetchedData, data]);

  // Apply theme and wallpaper from project or userDetails
  useEffect(() => {
    if (!projectData?.project) return;

    const project = projectData.project;

    // Set theme: project theme > userDetails theme
    if (project?.theme !== undefined) {
      setTheme(project.theme == 1 ? "dark" : "light");
    } else if (userDetails?.theme !== undefined) {
      setTheme(userDetails.theme == 1 ? "dark" : "light");
    }

    // Set wallpaper: project wallpaper > userDetails wallpaper
    if (project?.wallpaper !== undefined) {
      const wp = project.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    } else if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }

    // Set cursor: project cursor > project theme > userDetails cursor
    const cursor = project?.cursor != null
      ? project.cursor
      : (project?.theme != null ? project.theme : (userDetails?.cursor || 0));
    setCursor(cursor);
  }, [projectData?.project, userDetails, setTheme, setWallpaper, setCursor]);
  const project = projectData?.project;
  const isProtected = projectData?.isProtected || false;
  const projectWallpaper = project?.wallpaper;
  const wpValue = projectWallpaper && typeof projectWallpaper === 'object'
    ? (projectWallpaper.url || projectWallpaper.value)
    : projectWallpaper;
  
  // Compute wallpaper URL for this project
  const currentTheme = resolvedTheme || theme || (project?.theme == 1 ? "dark" : "light");
  const wallpaperUrl = wpValue && wpValue !== 0
    ? getWallpaperUrl(wpValue, currentTheme)
    : null;
  
  // Get wallpaper effects from project or userDetails
  const effects = project?.wallpaper?.effects || userDetails?.wallpaper?.effects || null;

  return (
    <>
      <Seo
        title={capitalizeWords(project?.title || data?.project?.title)}
        description={project?.description || data?.project?.description}
        keywords={project?.description || data?.project?.description}
        imageUrl={
          project?.thumbnail?.key || data?.project?.thumbnail?.key || "/assets/png/seo-profile.png"
        }
        url={`https://${project?.username || data?.project?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={effects} />
      <main className="min-h-screen">
        <div
          className={`max-w-[890px] mx-auto pt-[16px] pb-[80px] lg:py-[40px] px-2 md:px-4 lg:px-0`}
        >
          <motion.div
            className="flex-1 flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projectData && project && (
              <>
                {isProtected ? (
                  <motion.div variants={itemVariants}>
                    <ProjectPassword
                      status={1}
                      projectDetails={project}
                      id={router.query.id}
                      setIsProtected={(value) => {
                        if (!value && unlockedProjectData) {
                          setUnlockedProjectData(prev => ({ ...prev, isProtected: false }));
                        }
                      }}
                      setProjectDetails={(newData) => {
                        setUnlockedProjectData(newData);
                      }}
                    />
                  </motion.div>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <ProjectInfo projectDetails={project} />
                    </motion.div>
                    {project?.contentVersion === 2 && project?.tiptapContent ? (
                      <motion.div variants={itemVariants}>
                        <TiptapRenderer content={project.tiptapContent} />
                      </motion.div>
                    ) : project?.content ? (
                      <motion.div variants={itemVariants}>
                        <BlockRenderer
                          editorJsData={project.content}
                        />
                      </motion.div>
                    ) : null}
                  </>
                )}
              </>
            )}
          </motion.div>
        </div>
        {!project?.pro && (
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

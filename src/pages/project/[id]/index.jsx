import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import ProjectPassword from "@/components/projectPassword";
import Seo from "@/components/seo";
import TiptapRenderer from "@/components/tiptapRenderer";
import { useGlobalContext } from "@/context/globalContext";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { capitalizeWords } from "@/lib/capitalizeText";
import { _getProjectDetails, _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import MadeWithDesignfolio from "../../../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import { getWallpaperUrl } from "@/lib/wallpaper";
import MacOSWindowShell from "@/components/templates/MacOSDock/MacOSWindowShell";
import { getProjectUrl } from "@/lib/utils";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import { ChevronLeft } from "lucide-react";
import { TEMPLATE_IDS, TEMPLATES_BY_ID } from "@/lib/templates";
import CanvasProjectCta from "@/components/templates/Canvas/CanvasProjectCta";
import MonoProjectFooter from "@/components/templates/Mono/MonoProjectFooter";

export default function Index({
  data,
  ownerTemplate,
  ownerWallpaper,
  ownerUser,
}) {
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { setCursor, setWallpaper, userDetails, wallpaperEffects } =
    useGlobalContext();
  const [unlockedProjectData, setUnlockedProjectData] = useState(null);

  // Try to get project from context first (fastest)
  const contextProject = useMemo(() => {
    if (!router.query.id || !userDetails?.projects) return null;
    return userDetails.projects.find(
      (project) => project._id === router.query.id,
    );
  }, [router.query.id, userDetails?.projects]);

  const shouldFetch =
    router.isReady &&
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
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    } else if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }

    // Set cursor: project cursor > project theme > userDetails cursor
    const cursor =
      project?.cursor != null
        ? project.cursor
        : project?.theme != null
          ? project.theme
          : userDetails?.cursor || 0;
    setCursor(cursor);
  }, [projectData?.project, userDetails, setTheme, setWallpaper, setCursor]);
  const project = projectData?.project;
  const isProtected = projectData?.isProtected || false;
  // Always use the owner's portfolio template for layout — never the viewer's own template
  const effectiveTemplate = ownerTemplate ?? TEMPLATE_IDS.CHATFOLIO;
  const isMacOS = effectiveTemplate === TEMPLATE_IDS.RETRO_OS;
  const isCanvas = effectiveTemplate === TEMPLATE_IDS.CANVAS;
  const isMono = effectiveTemplate === TEMPLATE_IDS.MONO;

  // Set data-template on <html> so template-scoped CSS (canvas.css, mono.css etc.) works on the public page
  useEffect(() => {
    const templateValue = TEMPLATES_BY_ID[effectiveTemplate]?.value;
    if (templateValue) {
      document.documentElement.dataset.template = templateValue;
    } else {
      document.documentElement.removeAttribute("data-template");
    }
    return () => {
      document.documentElement.removeAttribute("data-template");
    };
  }, [effectiveTemplate]);
  // Use owner's profile when viewer has no userDetails (e.g. public visitor) so MacOS desktop still shows
  const effectiveUserDetails = userDetails ?? ownerUser ?? null;

  // Wallpaper priority: project wallpaper → owner wallpaper (for MacOS) → userDetails wallpaper
  const projectWallpaper = project?.wallpaper;
  const rawWp =
    projectWallpaper ||
    (isMacOS ? ownerWallpaper : null) ||
    userDetails?.wallpaper;
  const wpValue =
    rawWp && typeof rawWp === "object" ? rawWp.url || rawWp.value : rawWp;

  // Compute wallpaper URL for this project
  const currentTheme =
    resolvedTheme || theme || (project?.theme == 1 ? "dark" : "light");
  const wallpaperUrl =
    wpValue && wpValue !== 0 ? getWallpaperUrl(wpValue, currentTheme) : null;

  // Get wallpaper effects from project → owner → userDetails
  const effects =
    project?.wallpaper?.effects ||
    (isMacOS ? ownerWallpaper?.effects : null) ||
    userDetails?.wallpaper?.effects ||
    null;

  const canvasCta = isCanvas && !isProtected && project && (
    <CanvasProjectCta ownerUser={ownerUser} />
  );

  const monoCta = isMono && !isProtected && project && (
    <MonoProjectFooter ownerUser={ownerUser} />
  );

  const projectContent = (
    <div
      className={(() => {
        switch (effectiveTemplate) {
          case TEMPLATE_IDS.CANVAS:
            return "max-w-[640px] mx-auto flex flex-col gap-3 pb-20 pt-[80px] px-4 md:px-0";
          case TEMPLATE_IDS.MONO:
            return "max-w-[640px] mx-auto pb-20 pt-[80px] custom-dashed-x bg-[#F0EDE7] dark:bg-[#1A1A1A] min-h-screen";
          default:
            return "max-w-[848px] mx-auto pt-[16px] pb-[80px] lg:py-[40px] px-2 md:px-4 lg:px-0";
        }
      })()}
    >
      <motion.div
        className={`flex-1 flex flex-col ${isMono ? "" : "gap-3"}`}
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
                      setUnlockedProjectData((prev) => ({
                        ...prev,
                        isProtected: false,
                      }));
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
                  <ProjectInfo projectDetails={project} ownerTemplate={ownerTemplate} />
                </motion.div>
                {project?.contentVersion === 2 && project?.tiptapContent ? (
                  <motion.div variants={itemVariants} className={isMono ? "px-5 md:px-8 py-6" : ""}>
                    <TiptapRenderer key={project._id} content={project.tiptapContent} />
                  </motion.div>
                ) : project?.content ? (
                  <motion.div variants={itemVariants} className={isMono ? "px-5 md:px-8 py-6" : ""}>
                    <BlockRenderer editorJsData={project.content} />
                  </motion.div>
                ) : null}
                {canvasCta}
                {monoCta}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );

  return (
    <>
      <Seo
        title={capitalizeWords(project?.title || data?.project?.title)}
        description={project?.description || data?.project?.description}
        keywords={project?.description || data?.project?.description}
        imageUrl={
          project?.thumbnail?.key ||
          data?.project?.thumbnail?.key ||
          "/assets/png/seo-profile.png"
        }
        url={`https://${project?.username || data?.project?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={effects} />

      {isMacOS ? (
        <>
          {/* Full macOS desktop: use owner's profile when visitor has no userDetails */}
          {effectiveUserDetails && (
            <MacOSTemplate
              userDetails={effectiveUserDetails}
              edit={!!userDetails}
              preview={false}
            />
          )}
          {/* Project window floats on top as a fixed overlay */}
          <MacOSWindowShell
            title={project?.title || data?.project?.title || "Project"}
            projectUrl={getProjectUrl({
              username: project?.username || data?.project?.username,
              baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
              projectId: router.query.id,
            })}
          >
            {projectContent}
          </MacOSWindowShell>
        </>
      ) : (
        <main className="min-h-screen">
          {projectContent}
          {!project?.pro && (
            <div
              className={`text-center flex justify-center fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:bottom-[24px] lg:right-[unset] mb-2 xl:block cursor-pointer`}
              onClick={() =>
                window.open("https://www.designfolio.me", "_blank")
              }
            >
              <div className="bg-df-section-card-bg-color shadow-lg p-2 rounded-2xl">
                <MadeWithDesignfolio className="text-df-icon-color" />
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  try {
    const projectDetails = await _getProjectDetails(id, 1);

    if (projectDetails) {
      const projectData = projectDetails?.data;
      // Fetch the owner's user details for template, wallpaper, and MacOS desktop (testimonials, tools, etc.)
      let ownerTemplate = null;
      let ownerWallpaper = null;
      let ownerUser = null;
      try {
        const username = projectData?.project?.username;
        if (username) {
          const userResponse = await _getUser(username);
          const owner = userResponse?.data?.user;
          if (owner) {
            ownerTemplate = owner.template ?? null;
            ownerWallpaper = owner.wallpaper ?? null;
            ownerUser = owner;
          }
        }
      } catch (_) {}
      return {
        props: {
          data: projectData,
          ownerTemplate,
          ownerWallpaper,
          ownerUser,
          hideHeader: true,
        },
      };
    } else {
      return {
        redirect: {
          destination: "https://designfolio.me",
          permanent: false,
        },
      };
    }
  } catch (error) {
    return {
      redirect: {
        destination: "https://designfolio.me",
        permanent: false,
      },
    };
  }
}

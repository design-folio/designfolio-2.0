import dynamic from "next/dynamic";
import Seo from "@/components/seo";
import { useGlobalContext } from "@/context/globalContext";
import useClient from "@/hooks/useClient";
import {
  getWallpaperUrl,
  extractWallpaperMode,
  extractWallpaperColor,
  resolveBackgroundColor,
  BACKGROUND_MODE,
} from "@/lib/wallpaper";
import { normalizeTypography } from "@/lib/typography";
import { TEMPLATE_IDS } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect } from "react";
import WallpaperBackground from "@/components/WallpaperBackground";
import MemoMadewithdesignfolio from "@/components/icons/Madewithdesignfolio";

// ssr: false — templates depend on useGlobalContext and useTheme (client-only hooks).
const Canvas = dynamic(() => import("@/components/templates/Canvas"), { ssr: false });
const Chat = dynamic(() => import("@/components/templates/Chat"), { ssr: false });
const Minimal = dynamic(() => import("@/components/templates/Spotlight"), { ssr: false });
const Mono = dynamic(() => import("@/components/templates/Mono"), { ssr: false });
const Professional = dynamic(() => import("@/components/templates/Professional"), { ssr: false });
const MacOSTemplate = dynamic(() => import("@/components/comp/MacOSTemplate"), { ssr: false });

export default function Index({ initialUserDetails }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { isClient } = useClient();
  const {
    setWallpaper,
    setWallpaperEffects,
    wallpaperEffects,
    setUserDetails: setCtxUserDetails,
    setTemplateContext,
    setBackgroundMode,
    setContainerWidth,
    setTypography,
    viewerThemeOverride,
  } = useGlobalContext();

  const { data: userDetails } = useQuery({
    queryKey: [`portfolio-${router.query.id}`],
    queryFn: async () => {
      const response = await _getUser(router.query.id);
      return response?.data?.user;
    },
    initialData: initialUserDetails,
    enabled: !!router.query.id,
    cacheTime: 300000,
    staleTime: 0, //NOTE: we don't want to cache the user details for the preview page else the visitor count will not be counted.
  });

  // Use fetched data or initialUserDetails (from SSR)
  const finalUserDetails = userDetails || initialUserDetails;

  // Inject the portfolio owner's data into globalContext.
  // setTemplateContext updates globalContext's `template` state, which in turn
  // sets data-template on <html> via globalContext's own effect — ensuring a single
  // source of truth and no race between the page effect and the parent context effect.
  const userDetailsId = finalUserDetails?._id;
  const userDetailsUpdatedAt = finalUserDetails?.updatedAt;

  useEffect(() => {
    if (!finalUserDetails) return;
    setCtxUserDetails(finalUserDetails);
    if (finalUserDetails.template !== undefined) {
      setTemplateContext(finalUserDetails.template);
    }

    if (finalUserDetails?.theme !== undefined && !viewerThemeOverride) {
      setTheme(finalUserDetails.theme == 1 ? "dark" : "light");
    }

    if (finalUserDetails?.wallpaper !== undefined) {
      const wp = finalUserDetails.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
      if (wp && typeof wp === "object" && wp.effects) {
        setWallpaperEffects(wp.effects);
      }
      setBackgroundMode(extractWallpaperMode(wp));
    }
    setContainerWidth(finalUserDetails?.containerWidth ?? null);
    setTypography(normalizeTypography(finalUserDetails?.typography));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetailsId, userDetailsUpdatedAt]);

  const wp = finalUserDetails?.wallpaper;
  const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
  const currentTheme = resolvedTheme || theme || (finalUserDetails?.theme == 1 ? "dark" : "light");
  const isChatfolioTemplate = finalUserDetails?.template === TEMPLATE_IDS.CHATFOLIO;
  const wallpaperUrl = getWallpaperUrl(wpValue ?? 0, currentTheme, finalUserDetails?.template);
  const backgroundColor = resolveBackgroundColor(extractWallpaperColor(wp), currentTheme);
  const backgroundMode = extractWallpaperMode(wp);
  const isHeaderMode = backgroundMode === BACKGROUND_MODE.HEADER;
  const hasBackground = !!wallpaperUrl || !!backgroundColor;
  // Show the full-page background (transparent page) only with a background AND full-page mode.
  // Width is applied by each template's own container via context (containerMaxWidth).
  const transparentForWallpaper = hasBackground && !isHeaderMode;
  const ProBadge = !finalUserDetails?.pro && (
    <div
      className="relative mb-[120px] flex cursor-pointer justify-center text-center lg:fixed lg:right-[36px] lg:bottom-[20px] lg:m-1 xl:block"
      onClick={() => window.open("https://www.designfolio.me", "_blank")}
    >
      <MemoMadewithdesignfolio />
    </div>
  );

  const renderTemplate = () => {
    switch (finalUserDetails?.template) {
      case TEMPLATE_IDS.CANVAS:
        return (
          <>
            <Canvas preview publicView />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.CHATFOLIO:
        return (
          <>
            <Chat publicView />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.SPOTLIGHT:
        return (
          <>
            <Minimal userDetails={finalUserDetails} />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.MONO:
        return (
          <>
            <div aria-hidden="true" style={{ height: 200 }} />
            <Mono preview publicView />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.PROFESSIONAL:
        return (
          <>
            <Professional isEditing={false} />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.RETRO_OS:
        return (
          <>
            <MacOSTemplate userDetails={finalUserDetails} />
            {ProBadge}
          </>
        );
      default:
        return (
          <>
            <Canvas preview publicView />
            {ProBadge}
          </>
        );
    }
  };

  const fullName = [finalUserDetails?.firstName, finalUserDetails?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Seo
        title={fullName}
        description={finalUserDetails?.introduction}
        keywords={`${finalUserDetails?.skillsString}`}
        author={fullName}
        imageUrl={finalUserDetails?.avatar?.url ?? "/assets/png/seo-profile.png"}
        url={`https://${finalUserDetails?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <div className="relative">
        <WallpaperBackground
          wallpaperUrl={wallpaperUrl}
          backgroundColor={backgroundColor}
          mode={backgroundMode}
          effects={wallpaperEffects}
        />
        <main
          className={cn(
            "flex min-h-screen justify-center transition-colors duration-700",
            isChatfolioTemplate && !transparentForWallpaper && "bg-[#F0EDE7] dark:bg-[#1A1A1A]",
            !isChatfolioTemplate && !transparentForWallpaper && "bg-background"
          )}
        >
          <div
            className={cn(
              (() => {
                switch (finalUserDetails?.template) {
                  case TEMPLATE_IDS.CANVAS:
                    return "py-10";
                  case TEMPLATE_IDS.MONO:
                    return "";
                  case TEMPLATE_IDS.CHATFOLIO:
                    return "w-full py-[94px]";
                  case TEMPLATE_IDS.RETRO_OS:
                    return "mx-auto px-2 md:px-4 lg:px-0";
                  case TEMPLATE_IDS.PROFESSIONAL:
                    return "";
                  default:
                    return "py-10";
                }
              })(),
              isHeaderMode &&
                finalUserDetails?.template !== TEMPLATE_IDS.RETRO_OS &&
                "relative z-10 w-full"
            )}
          >
            {finalUserDetails && renderTemplate()}
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  try {
    const userResponse = await _getUser(id);
    const user = userResponse?.data?.user;
    if (user) {
      return {
        props: {
          initialUserDetails: user,
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
};

import { useGlobalContext } from "@/context/globalContext";
import { useEffect, startTransition } from "react";
import Template2 from "@/components/template2";
import Minimal from "@/components/templates/Spotlight";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import WallpaperBackground from "@/components/WallpaperBackground";
import Canvas from "@/components/templates/Canvas";
import Mono from "@/components/templates/Mono";
import { TEMPLATE_IDS } from "@/lib/templates";
import Chat from "@/components/templates/Chat";
import Professional from "@/components/templates/Professional";
import MemoMadewithdesignfolio from "@/components/icons/Madewithdesignfolio";
import { BACKGROUND_MODE, hasNoWallpaper } from "@/lib/wallpaper";
import { cn } from "@/lib/utils";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    userDetailLoading,
    template,
    setWallpaper,
    setWallpaperEffects,
    wallpaperUrl,
    wallpaperColorResolved,
    wallpaperEffects,
    wallpaper,
    backgroundMode,
  } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = wp && typeof wp === "object" ? wp.url || wp.value : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
      if (wp && typeof wp === "object" && wp.effects) {
        setWallpaperEffects(wp.effects);
      }
    }
  }, [userDetails?.wallpaper, setWallpaper, setWallpaperEffects]);

  const ProBadge = !userDetails?.pro && (
    <div
      className="relative mb-[120px] flex cursor-pointer justify-center text-center lg:fixed lg:right-[36px] lg:bottom-[10px] lg:m-0 xl:block"
      onClick={() => window.open("https://www.designfolio.me", "_blank")}
    >
      <MemoMadewithdesignfolio />
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return (
          <>
            <div className="mx-auto w-full max-w-[848px] px-4 pt-6 pb-2 md:px-0">
              <Button
                variant="outline"
                className="rounded-full border border-[#E5D7C4] bg-white transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
                size="sm"
                onClick={() => router.push("/builder")}
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Preview
              </Button>
            </div>
            <Canvas isEditing={false} preview />
          </>
        );
      case TEMPLATE_IDS.CHATFOLIO:
        return (
          <div className="flex min-h-screen flex-col items-center bg-[#F0EDE7] transition-colors duration-700 dark:bg-[#1A1A1A]">
            <div className="w-full max-w-[700px] px-4 pt-6 pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/builder")}
                className="rounded-full border border-black/10 bg-[#E5E2DB] text-[#1A1A1A] hover:bg-[#DEDAD3] dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Preview
              </Button>
            </div>
            <Chat preview />
          </div>
        );
      case TEMPLATE_IDS.SPOTLIGHT:
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/builder")}
              className="mt-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Minimal userDetails={userDetails} edit={false} />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.MONO:
        return (
          <>
            <div className="mx-auto w-full max-w-[848px] px-4 pt-6 pb-2 md:px-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/builder")}
                className="rounded-full border border-[#D5D0C6] bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Preview
              </Button>
            </div>
            <div aria-hidden="true" style={{ height: 200 }} />
            <Mono preview />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.PROFESSIONAL:
        return (
          <>
            <div className="sticky top-0 z-[100] flex w-full justify-center border-b border-[#D5D0C6] bg-[#EFECE6] dark:border-[#3A352E] dark:bg-[#1A1A1A]">
              <div className="flex w-full max-w-[700px] items-center px-4 py-2">
                <button
                  onClick={() => router.push("/builder")}
                  className="font-jetbrains flex items-center gap-2 text-[13px] tracking-wide text-[#1A1A1A] uppercase transition-colors hover:text-[#E37941] dark:text-[#B5AFA5]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Exit Preview
                </button>
              </div>
            </div>
            <Professional isEditing={false} preview />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.RETRO_OS:
        return (
          <>
            <MacOSTemplate userDetails={userDetails} edit={false} preview={false} />
            {ProBadge}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/builder")}
              className="absolute top-4 left-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </>
        );
      default:
        return (
          <>
            <div className="mx-auto w-full max-w-[848px] px-4 pt-6 pb-2 md:px-0">
              <Button
                variant="outline"
                className="rounded-full border border-[#E5D7C4] bg-white transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
                size="sm"
                onClick={() => router.push("/builder")}
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Preview
              </Button>
            </div>
            <Canvas isEditing={false} preview />
          </>
        );
    }
  };

  useEffect(() => {
    startTransition(() => setIsUserDetailsFromCache(!userDetailsIsState));
  }, [userDetailsIsState, setIsUserDetailsFromCache]);

  if (!userDetails && userDetailLoading) return null;

  const fullWidth =
    template === TEMPLATE_IDS.MONO ||
    template === TEMPLATE_IDS.RETRO_OS ||
    template === TEMPLATE_IDS.CANVAS ||
    template === TEMPLATE_IDS.PROFESSIONAL ||
    template === TEMPLATE_IDS.CHATFOLIO;

  const isHeaderMode = backgroundMode === BACKGROUND_MODE.HEADER;
  const hasBackground = !hasNoWallpaper(wallpaper, template) || !!wallpaperColorResolved;
  const transparentForWallpaper = hasBackground && !isHeaderMode;

  return (
    <div className="relative">
      <WallpaperBackground
        wallpaperUrl={wallpaperUrl}
        backgroundColor={wallpaperColorResolved}
        mode={backgroundMode}
        effects={wallpaperEffects}
      />
      <main
        className={cn(
          "min-h-screen transition-colors duration-700",
          !transparentForWallpaper && template !== TEMPLATE_IDS.CHATFOLIO && "bg-background",
          !transparentForWallpaper &&
            template === TEMPLATE_IDS.CHATFOLIO &&
            "bg-[#F0EDE7] dark:bg-[#1A1A1A]"
        )}
      >
        <div
          className={cn(
            "mx-auto px-2 md:px-4 lg:px-0",
            !fullWidth && "max-w-[848px]",
            isHeaderMode && template !== TEMPLATE_IDS.RETRO_OS && "relative z-10"
          )}
        >
          {userDetails && renderTemplate()}
        </div>
      </main>
    </div>
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

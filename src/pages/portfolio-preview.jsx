import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";
import Template2 from "@/components/template2";
import Minimal from "@/components/comp/Minimal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import MadeWithDesignfolio from "../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import Canvas from "@/components/templates/Canvas";
import Mono from "@/components/templates/Mono";
import { TEMPLATE_IDS } from "@/lib/templates";
import Chat from "@/components/templates/Chat";
import Professional from "@/components/templates/Professional";

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
    wallpaperEffects,
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
      className="text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] xl:block cursor-pointer mb-[120px] lg:m-0"
      onClick={() => window.open("https://www.designfolio.me", "_blank")}
    >
      <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
        <MadeWithDesignfolio className="text-df-icon-color" />
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case TEMPLATE_IDS.CANVAS:
        return (
          <>
            <div className="max-w-[720px] mx-auto w-full px-4 md:px-0 pt-6 pb-2">
              <Button
                variant="outline"
                className="bg-white dark:bg-[#2A2520] rounded-full hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors border border-[#E5D7C4] dark:border-white/10"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Preview
              </Button>
            </div>
            <Canvas isEditing={false} preview />
          </>
        );
      case TEMPLATE_IDS.CHATFOLIO:
        return (
          <>
            <div className="max-w-[848px] mx-auto w-full pt-6 pb-2 px-4 md:px-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="rounded-full bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A] border border-border"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Preview
              </Button>
            </div>
            <Chat preview />
          </>
        );
      case TEMPLATE_IDS.SPOTLIGHT:
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mt-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Minimal userDetails={userDetails} edit={false} />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.MONO:
        return (
          <>
            <div className="max-w-[640px] mx-auto w-full px-4 md:px-0 pt-6 pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="rounded-full bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A] border border-[#D5D0C6] dark:border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Preview
              </Button>
            </div>
            <Mono preview />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.PROFESSIONAL:
        return (
          <>
            <div className="w-full sticky top-0 z-[100] border-b border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] flex justify-center">
              <div className="w-full max-w-[640px] px-4 py-2 flex items-center">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 font-jetbrains text-[13px] uppercase tracking-wide text-[#1A1A1A] dark:text-[#B5AFA5] hover:text-[#E37941] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
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
            <MacOSTemplate
              userDetails={userDetails}
              edit={false}
              preview={false}
            />
            {ProBadge}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="absolute top-4 left-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </>
        );
      default:
        return (
          <>
            <Template2 userDetails={userDetails} preview />
            {ProBadge}
          </>
        );
    }
  };

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  if (!userDetails && userDetailLoading) return null;

  const fullWidth =
    template === TEMPLATE_IDS.MONO ||
    template === TEMPLATE_IDS.RETRO_OS ||
    template === TEMPLATE_IDS.CANVAS ||
    template === TEMPLATE_IDS.PROFESSIONAL;

  return (
    <>
      <WallpaperBackground
        wallpaperUrl={wallpaperUrl}
        effects={wallpaperEffects}
      />
      <main className="min-h-screen">
        <div
          className={`mx-auto px-2 md:px-4 lg:px-0 ${fullWidth ? "" : "max-w-[848px]"}`}
        >
          {userDetails && renderTemplate()}
        </div>
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

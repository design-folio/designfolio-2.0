import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";
import Template2 from "@/components/template2";
import BottomNavigation from "@/components/bottomNavigation";
import Minimal from "@/components/comp/Minimal";
import Button from "@/components/button";
import { useRouter } from "next/router";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import MadeWithDesignfolio from "../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import Canvas from "@/components/templates/Canvas";
import Mono from "@/components/templates/Mono";
import { TEMPLATE_IDS } from "@/lib/templates";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    userDetailLoading,
    projectRef,
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
        return <Canvas isEditing={false} preview />;
      case TEMPLATE_IDS.CHATFOLIO:
        return <><Template2 userDetails={userDetails} preview />{ProBadge}</>;
      case TEMPLATE_IDS.SPOTLIGHT:
        return (
          <>
            <Button
              text="Go Back"
              onClick={() => router.back()}
              type="secondary"
              size="small"
              customClass="!transition-none mt-8"
              icon={<LeftArrow className="cursor-pointer" />}
            />
            <Minimal userDetails={userDetails} edit={false} />
            {ProBadge}
          </>
        );
      case TEMPLATE_IDS.MONO:
        return <><Mono preview />{ProBadge}</>;
      case TEMPLATE_IDS.RETRO_OS:
        return (
          <>
            <MacOSTemplate userDetails={userDetails} edit={false} preview={false} />
            {ProBadge}
            <Button
              text="Go Back"
              onClick={() => router.back()}
              type="secondary"
              size="small"
              customClass="!transition-none mt-8 absolute top-4 left-8"
              icon={<LeftArrow className="cursor-pointer" />}
            />
          </>
        );
      default:
        return <><Template2 userDetails={userDetails} preview />{ProBadge}</>;
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

  const fullWidth = template === TEMPLATE_IDS.MONO || template === TEMPLATE_IDS.RETRO_OS || template === TEMPLATE_IDS.CANVAS;

  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className="min-h-screen">
        <div className={`mx-auto px-2 md:px-4 lg:px-0 ${fullWidth ? "" : "max-w-[848px]"}`}>
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

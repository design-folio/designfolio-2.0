import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";
import Preview1 from "@/components/preview1";
import Template2 from "@/components/template2";
import BottomNavigation from "@/components/bottomNavigation";
import Minimal from "@/components/comp/Minimal";
import Button from "@/components/button";
import { useRouter } from "next/router";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import Portfolio from "@/components/comp/Portfolio";
import MadeWithDesignfolio from "../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    projectRef,
    template,
    setWallpaper,
    wallpaperUrl,
    wallpaperEffects,
  } = useGlobalContext();
  const router = useRouter();

  // Restore wallpaper from userDetails when component mounts
  useEffect(() => {
    if (userDetails?.wallpaper !== undefined) {
      const wp = userDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }
  }, [userDetails?.wallpaper, setWallpaper]);

  const renderTemplate = () => {
    switch (template) {
      case 0:
        return <Preview1 userDetails={userDetails} projectRef={projectRef} />;
      case 1:
        return (
          <>
            <Template2 userDetails={userDetails} preview />
            {!userDetails?.pro && (
              <div
                className={`text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] xl:block cursor-pointer mb-[120px] lg:m-0`}
                onClick={() =>
                  window.open("https://www.designfolio.me", "_blank")
                }
              >
                <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
                  <MadeWithDesignfolio className="text-df-icon-color" />
                </div>
              </div>
            )}
          </>
        );
      case 2:
        return (
          <div>
            <Button
              text="Go Back"
              onClick={() => router.back()}
              type="secondary"
              size="small"
              customClass="!transition-none mt-8"
              icon={<LeftArrow className="cursor-pointer" />}
            />
            <Minimal userDetails={userDetails} edit={false} />
            {!userDetails?.pro && (
              <div
                className={`text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] xl:block cursor-pointer mb-[120px] lg:m-0`}
                onClick={() =>
                  window.open("https://www.designfolio.me", "_blank")
                }
              >
                <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
                  <MadeWithDesignfolio className="text-df-icon-color" />
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <div className="max-w-[768px] m-auto pb-4">
              <Button
                text="Go Back"
                onClick={() => router.back()}
                type="secondary"
                size="small"
                customClass="!transition-none mt-8"
                icon={<LeftArrow className="cursor-pointer" />}
              />
            </div>
            <Portfolio userDetails={userDetails} edit={false} />
            {!userDetails?.pro && (
              <div
                className={`text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] xl:block cursor-pointer mb-[120px] lg:m-0`}
                onClick={() =>
                  window.open("https://www.designfolio.me", "_blank")
                }
              >
                <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
                  <MadeWithDesignfolio className="text-df-icon-color" />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <Preview1 userDetails={userDetails} projectRef={projectRef} />;
    }
  };

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);
  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className="min-h-screen">
        <div
          className={` mx-auto px-2 md:px-4 lg:px-0 ${template != 3 && "max-w-[848px]"
            }`}
        >
          {renderTemplate()}
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

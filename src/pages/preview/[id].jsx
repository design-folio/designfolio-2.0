import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import Seo from "@/components/seo";
import WallpaperBackground from "@/components/WallpaperBackground";
import { capitalizeWords } from "@/lib/capitalizeText";
import Template1 from "@/components/template";
import Template2 from "@/components/template2";
import BottomNavigation from "@/components/bottomNavigation";
import useClient from "@/hooks/useClient";
import Minimal from "@/components/comp/Minimal";
import Portfolio from "@/components/comp/Portfolio";
import MadeWithDesignfolio from "../../../public/assets/svgs/madewithdesignfolio.svg";
import { getWallpaperUrl } from "@/lib/wallpaper";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/context/globalContext";

export default function Index({ initialUserDetails }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { isClient } = useClient();
  const {
    setWallpaper,
  } = useGlobalContext();

  const { data: userDetails } = useQuery({
    queryKey: [`portfolio-${router.query.id}`],
    queryFn: async () => {
      const response = await _getUser(router.query.id);
      return response?.data?.user;
    },
    placeholderData: initialUserDetails,
    enabled: !!router.query.id,
    cacheTime: 300000,
    staleTime: 60000,
  });

  // Use fetched data or initialUserDetails (from SSR)
  const finalUserDetails = userDetails || initialUserDetails;

  // Apply theme and wallpaper from finalUserDetails
  useEffect(() => {
    if (!finalUserDetails) return;

    // Set theme
    if (finalUserDetails?.theme !== undefined) {
      setTheme(finalUserDetails.theme == 1 ? "dark" : "light");
    }

    // Set wallpaper
    if (finalUserDetails?.wallpaper !== undefined) {
      const wp = finalUserDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
    }
  }, [finalUserDetails, setTheme, setWallpaper]);

  const wp = finalUserDetails?.wallpaper;
  const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
  const currentTheme = resolvedTheme || theme || (finalUserDetails?.theme == 1 ? "dark" : "light");
  const wallpaperUrl = wpValue && wpValue !== 0
    ? getWallpaperUrl(wpValue, currentTheme)
    : null;
  const renderTemplate = () => {
    switch (finalUserDetails?.template) {
      case 0:
        return <Template1 userDetails={finalUserDetails} />;
      case 1:
        return (
          <>
            <Template2 userDetails={finalUserDetails} />
            {isClient && !finalUserDetails?.pro && (
              <BottomNavigation
                userDetails={finalUserDetails}
                className="bg-gradient-to-t from-transparent top-0 pt-5"
                watermarkClassName="!top-7"
              />
            )}
          </>
        );

      case 2:
        return (
          <>
            <Minimal userDetails={finalUserDetails} />
            {!finalUserDetails?.pro && (
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
      case 3:
        return (
          <>
            <Portfolio userDetails={finalUserDetails} />
            {!finalUserDetails?.pro && (
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

      default:
        return <Template1 userDetails={finalUserDetails} />;
    }
  };

  return (
    <>
      <Seo
        title={`${finalUserDetails?.firstName} ${finalUserDetails?.lastName}`}
        description={finalUserDetails?.introduction}
        keywords={`${finalUserDetails?.skillsString}`}
        author={`${finalUserDetails?.firstName} ${finalUserDetails?.lastName}`}
        imageUrl={finalUserDetails?.avatar?.url ?? "/assets/png/seo-profile.png"}
        url={`https://${finalUserDetails?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <WallpaperBackground
        wallpaperUrl={wallpaperUrl}
        key={`wallpaper-${wallpaperUrl}`}
      />
      <main className={cn(
        "min-h-screen",
        wallpaperUrl ? "bg-transparent" : "bg-df-bg-color"
      )}>
        <div
          className={` mx-auto px-2 md:px-4 lg:px-0 ${finalUserDetails?.template != 3 && "max-w-[890px]"
            }`}
        >
          {finalUserDetails && renderTemplate()}
        </div>
      </main>
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

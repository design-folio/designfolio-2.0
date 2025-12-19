import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import Seo from "@/components/seo";
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

export default function Index({ initialUserDetails }) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { data: userDetails } = useQuery({
    queryKey: [`portfolio-${router.query.id}`],
    queryFn: async () => {
      const response = await _getUser(router.query.id);
      return response?.data?.user;
    },
    placeholderData: initialUserDetails,
  });
  const { isClient } = useClient();

  useEffect(() => {
    if (userDetails) {
      setTheme(userDetails?.theme == 1 ? "dark" : "light");
    }
  }, [userDetails, setTheme]);

  const wp = userDetails?.wallpaper;
  const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
  const currentTheme = resolvedTheme || theme || (userDetails?.theme == 1 ? "dark" : "light");
  const wallpaperUrl = wpValue && wpValue !== 0
    ? getWallpaperUrl(wpValue, currentTheme)
    : null;
  const renderTemplate = () => {
    switch (userDetails?.template) {
      case 0:
        return <Template1 userDetails={userDetails} />;
      case 1:
        return (
          <>
            <Template2 userDetails={userDetails} />
            {isClient && !userDetails?.pro && (
              <BottomNavigation
                userDetails={userDetails}
                className="bg-gradient-to-t from-transparent top-0 pt-5"
                watermarkClassName="!top-7"
              />
            )}
          </>
        );

      case 2:
        return (
          <>
            <Minimal userDetails={userDetails} />
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
      case 3:
        return (
          <>
            <Portfolio userDetails={userDetails} />
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

      default:
        return <Template1 userDetails={userDetails} />;
    }
  };

  return (
    <>
      <Seo
        title={`${userDetails?.firstName} ${userDetails?.lastName}`}
        description={userDetails?.introduction}
        keywords={`${userDetails?.skillsString}`}
        author={`${userDetails?.firstName} ${userDetails?.lastName}`}
        imageUrl={userDetails?.avatar?.url ?? "/assets/png/seo-profile.png"}
        url={`https://${userDetails?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      {wallpaperUrl && (
        <div
          key={`wallpaper-${wallpaperUrl}`}
          suppressHydrationWarning
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${wallpaperUrl})`,
            pointerEvents: 'none'
          }}
        />
      )}
      <main className={cn(
        "min-h-screen",
        wallpaperUrl ? "bg-transparent" : "bg-df-bg-color"
      )}>
        <div
          className={` mx-auto px-2 md:px-4 lg:px-0 ${userDetails?.template != 3 && "max-w-[890px]"
            }`}
        >
          {userDetails && renderTemplate()}
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

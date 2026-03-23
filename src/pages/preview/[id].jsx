import Minimal from "@/components/comp/Minimal";
import MacOSTemplate from "@/components/comp/MacOSTemplate";
import Seo from "@/components/seo";
import Template2 from "@/components/template2";
import { useGlobalContext } from "@/context/globalContext";
import useClient from "@/hooks/useClient";
import { getWallpaperUrl } from "@/lib/wallpaper";
import { TEMPLATE_IDS } from "@/lib/templates";
import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MadeWithDesignfolio from "../../../public/assets/svgs/madewithdesignfolio.svg";
import WallpaperBackground from "@/components/WallpaperBackground";
import Canvas from "@/components/templates/Canvas";
import Mono from "@/components/templates/Mono";

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
    staleTime: 300000,
  });

  // Use fetched data or initialUserDetails (from SSR)
  const finalUserDetails = userDetails || initialUserDetails;

  // Inject the portfolio owner's data into globalContext.
  // setTemplateContext updates globalContext's `template` state, which in turn
  // sets data-template on <html> via globalContext's own effect — ensuring a single
  // source of truth and no race between the page effect and the parent context effect.
  useEffect(() => {
    if (!finalUserDetails) return;
    setCtxUserDetails(finalUserDetails);
    if (finalUserDetails.template !== undefined) {
      setTemplateContext(finalUserDetails.template);
    }

    if (finalUserDetails?.theme !== undefined) {
      setTheme(finalUserDetails.theme == 1 ? "dark" : "light");
    }

    if (finalUserDetails?.wallpaper !== undefined) {
      const wp = finalUserDetails.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);
      if (wp && typeof wp === 'object' && wp.effects) {
        setWallpaperEffects(wp.effects);
      }
    }
  }, [finalUserDetails, setTheme, setWallpaper, setWallpaperEffects, setCtxUserDetails, setTemplateContext]);

  const wp = finalUserDetails?.wallpaper;
  const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
  const currentTheme = resolvedTheme || theme || (finalUserDetails?.theme == 1 ? "dark" : "light");
  const wallpaperUrl = getWallpaperUrl(wpValue ?? 0, currentTheme, finalUserDetails?.template);
  const ProBadge = !finalUserDetails?.pro && (
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
    switch (finalUserDetails?.template) {
      case TEMPLATE_IDS.CANVAS:
        return <><Canvas preview publicView />{ProBadge}</>;
      case TEMPLATE_IDS.CHATFOLIO:
        return <><Template2 userDetails={finalUserDetails} />{ProBadge}</>;
      case TEMPLATE_IDS.SPOTLIGHT:
        return <><Minimal userDetails={finalUserDetails} />{ProBadge}</>;
      case TEMPLATE_IDS.MONO:
        return <><Mono preview publicView />{ProBadge}</>;
      case TEMPLATE_IDS.RETRO_OS:
        return <><MacOSTemplate userDetails={finalUserDetails} />{ProBadge}</>;
      default:
        return <><Template2 userDetails={finalUserDetails} />{ProBadge}</>;
    }
  };


  const fullName = [finalUserDetails?.firstName, finalUserDetails?.lastName].filter(Boolean).join(' ');

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
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className="min-h-screen">
        <div
          className={(() => {
            switch (finalUserDetails?.template) {
              case TEMPLATE_IDS.CANVAS:
                return "py-10";
              case TEMPLATE_IDS.MONO:
                return "py-10";
              case TEMPLATE_IDS.RETRO_OS:
                return "mx-auto px-2 md:px-4 lg:px-0";
              default:
                return "max-w-[848px] mx-auto px-2 md:px-4 lg:px-0";
            }
          })()}
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

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

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    projectRef,
    template,
  } = useGlobalContext();
  const router = useRouter();

  const renderTemplate = () => {
    switch (template) {
      case 0:
        return <Preview1 userDetails={userDetails} projectRef={projectRef} />;
      case 1:
        return (
          <>
            <Template2 userDetails={userDetails} preview />
            <BottomNavigation
              userDetails={userDetails}
              className="bg-gradient-to-t from-transparent top-0 pt-5"
              watermarkClassName="!top-7"
            />
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
            <div
              className={`text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] mb-2 xl:block cursor-pointer`}
              onClick={() =>
                window.open("https://www.designfolio.me", "_blank")
              }
            >
              <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
                <MadeWithDesignfolio className="text-df-icon-color" />
              </div>
            </div>
          </div>
        );
      case 3:
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
            <Portfolio userDetails={userDetails} edit={false} />
            <div
              className={`text-center flex justify-center relative lg:fixed lg:right-[36px] lg:bottom-[10px] mb-2 xl:block cursor-pointer`}
              onClick={() =>
                window.open("https://www.designfolio.me", "_blank")
              }
            >
              <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow p-2 rounded-2xl">
                <MadeWithDesignfolio className="text-df-icon-color" />
              </div>
            </div>
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
    <main className="min-h-screen bg-df-bg-color">
      <div className={`max-w-[890px] mx-auto px-2 md:px-4 lg:px-0`}>
        {renderTemplate()}
      </div>
    </main>
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

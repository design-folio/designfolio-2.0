import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";
import Preview1 from "@/components/preview1";
import Template2 from "@/components/template2";
import BottomNavigation from "@/components/bottomNavigation";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    projectRef,
    template,
  } = useGlobalContext();

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

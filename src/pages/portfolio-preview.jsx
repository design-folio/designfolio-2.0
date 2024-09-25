import BottomLayout from "@/components/bottomLayout";
import Others from "@/components/others";
import OthersPreview from "@/components/othersPreview";
import Profile from "@/components/profile";
import Projects from "@/components/Projects";
import Reviews from "@/components/reviews";
import Tools from "@/components/tools";
import Works from "@/components/works";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";

export default function Index() {
  const {
    setIsUserDetailsFromCache,
    userDetailsIsState,
    userDetails,
    projectRef,
  } = useGlobalContext();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);
  return (
    <BottomLayout>
      <main className="min-h-screen bg-df-bg-color">
        <div
          className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0 pb-[140px]`}
        >
          {userDetails && (
            <div className="flex-1 flex flex-col gap-4 md:gap-6">
              <Profile userDetails={userDetails} />
              <Projects userDetails={userDetails} projectRef={projectRef} />
              <Reviews userDetails={userDetails} />
              <Tools userDetails={userDetails} />
              <Works userDetails={userDetails} />
              {/* <Others userDetails={userDetails} /> */}
              <OthersPreview userDetails={userDetails} />
            </div>
          )}
        </div>
      </main>
    </BottomLayout>
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

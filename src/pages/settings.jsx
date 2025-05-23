import React, { useEffect } from "react";
import Button from "@/components/button";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import ChangePassword from "@/components/changePassword";
import ChangeUsername from "@/components/changeUsername";
import DeleteAccount from "@/components/deleteAccount";

export default function Settings() {
  const { userDetails, setIsUserDetailsFromCache, userDetailsIsState } =
    useGlobalContext();
  const router = useRouter();
  const handleBack = () => {
    router.back({ scroll: false });
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
      <div
        className={`max-w-[890px]  mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
      >
        <div className="bg-df-section-card-bg-color p-8 rounded-2xl">
          <Button
            text="Go Back"
            onClick={handleBack}
            type="secondary"
            size="small"
            icon={<LeftArrow className="text-df-icon-color cursor-pointer" />}
          />
          <div className="mt-6">
            {userDetails?.loginMethod == 0 && (
              <div>
                <ChangePassword />
              </div>
            )}

            <div className="mt-10">
              <ChangeUsername />
            </div>
            <div className="mt-10">
              <DeleteAccount />
            </div>
          </div>
        </div>
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
    props: { dfToken: !!dfToken },
  };
};

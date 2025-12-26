import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttonNew";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/globalContext";
import ChangePassword from "@/components/changePassword";
import DeleteAccount from "@/components/deleteAccount";
import CustomDomain from "@/components/customDomain";
import DefaultDomain from "@/components/defaultDomain";
import Transaction from "@/components/transaction";
import MemoLeftArrow from "@/components/icons/LeftArrow";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { hasNoWallpaper } from "@/lib/wallpaper";
import { sidebars } from "@/lib/constant";

export default function Settings() {
  const {
    userDetails,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    domainDetails,
    fetchDomainDetails,
    wallpaper,
    activeSidebar,
  } = useGlobalContext();

  useEffect(() => {
    const body = document.body;
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    let marginWidth = '0px';
    if (activeSidebar === sidebars.work || activeSidebar === sidebars.review) {
      marginWidth = '500px';
    } else if (activeSidebar === sidebars.theme) {
      marginWidth = '320px';
    }

    body.style.marginRight = marginWidth;

    return () => {
      body.style.marginRight = '0px';
      body.style.transition = '';
    };
  }, [activeSidebar]);

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
    <main className={cn(
      "min-h-screen",
      hasNoWallpaper(wallpaper) ? "bg-df-bg-color" : "bg-transparent"
    )}>
      <div
        className={`max-w-[890px]  mx-auto py-[94px] md:py-[124px] px-2 md:px-4 lg:px-0`}
      >
        <div className="bg-df-section-card-bg-color p-8 rounded-2xl">
          <Link href="/builder">
            <Button
              // onClick={handleBack}
              variant="secondary"
              className="rounded-full px-4 h-9 text-sm font-medium "
            >
              <MemoLeftArrow className="!size-2.5" />
              Go Back
            </Button>
          </Link>
          <div className="mt-8">
            <DefaultDomain />
          </div>
        </div>
        <div className="bg-df-section-card-bg-color p-8 rounded-2xl mt-6">
          <CustomDomain
            domainDetails={domainDetails}
            fetchDomainDetails={fetchDomainDetails}
          />
        </div>
        {userDetails?.pro && (
          <div className="bg-df-section-card-bg-color p-8 rounded-2xl mt-6">
            <Transaction />
          </div>
        )}
        <div className="bg-df-section-card-bg-color p-8 rounded-2xl mt-6">
          <div className="mt-6">
            {userDetails?.loginMethod == 0 && (
              <div>
                <ChangePassword />
              </div>
            )}

            {/* <div className="mt-10">
              <ChangeUsername />
            </div> */}
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

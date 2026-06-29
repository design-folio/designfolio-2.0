import Button from "@/components/button";
import { useRouter } from "next/router";
import React, { useEffect, useState, startTransition } from "react";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import DeleteAccount from "@/components/deleteAccount";
import DefaultDomain from "@/components/defaultDomain";
import { useGlobalContext } from "@/context/globalContext";
import CustomDomain from "@/components/customDomain";
import { _getDomainDetails } from "@/network/get-request";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function Domains() {
  const {
    userDetails,
    setIsUserDetailsFromCache,
    userDetailsIsState,
    wallpaperUrl,
    wallpaperEffects,
  } = useGlobalContext();
  const [domainDetails, setDomainDetails] = useState(null);
  const router = useRouter();
  const handleBack = () => {
    router.back({ scroll: false });
  };
  const fetchDomainDetails = () => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  };

  useEffect(() => {
    startTransition(() => setIsUserDetailsFromCache(!userDetailsIsState));
    fetchDomainDetails();
  }, [userDetailsIsState, setIsUserDetailsFromCache]);
  return (
    <>
      <WallpaperBackground wallpaperUrl={wallpaperUrl} effects={wallpaperEffects} />
      <main className="min-h-screen">
        <div className={`mx-auto max-w-[848px] px-2 py-[94px] md:px-4 md:py-[124px] lg:px-0`}>
          <div className="bg-df-section-card-bg-color rounded-2xl p-8">
            <Button
              text="Go Back"
              onClick={handleBack}
              type="secondary"
              size="small"
              icon={<LeftArrow className="text-df-icon-color cursor-pointer" />}
            />
            <div className="mt-8">
              <DefaultDomain />
            </div>
          </div>
          <div className="bg-df-section-card-bg-color mt-6 rounded-2xl p-8">
            <CustomDomain domainDetails={domainDetails} fetchDomainDetails={fetchDomainDetails} />
          </div>

          <div className="bg-df-section-card-bg-color mt-6 rounded-2xl p-8">
            <DeleteAccount />
          </div>
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
    props: { dfToken: !!dfToken },
  };
};

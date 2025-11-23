import Button from "@/components/button";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import DeleteAccount from "@/components/deleteAccount";
import DefaultDomain from "@/components/defaultDomain";
import { useGlobalContext } from "@/context/globalContext";
import CustomDomain from "@/components/customDomain";
import { _getDomainDetails } from "@/network/get-request";

export default function Domains() {
  const { userDetails, setIsUserDetailsFromCache, userDetailsIsState } =
    useGlobalContext();
  const [domainDetails, setDomainDetails] = useState(null);
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
    fetchDomainDetails();
  }, []);

  const fetchDomainDetails = () => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  };
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

        <div className="bg-df-section-card-bg-color p-8 rounded-2xl mt-6">
          <DeleteAccount />
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

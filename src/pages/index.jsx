import Home from "@/components/home";
import Seo from "@/components/seo";
import { useGlobalContext } from "@/context/globalContext";
import React, { useEffect } from "react";

export default function Index({ dfToken }) {
  const { setCursor, userDetails } = useGlobalContext();
  useEffect(() => {
    setCursor(0);
    return () => {
      console.log("Component unmounted");

      setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
    };
  }, [userDetails]);
  return (
    <div className="bg-landing-bg-color min-h-screen">
      <Seo
        title={"Designfolio - Build your Design Portfolio Website super Fast"}
        description={
          "Effortlessly create a professional online design portfolio to showcase your work. Begin building your dream portfolio today."
        }
        keywords={`ui ux design portfolio, graphic design portfolio, design portfolio, portfolio website, product design portfolio website`}
        author={`Designfolio`}
        imageUrl={"https://designfolio.me/assets/png/designfolio-thumbnail.png"}
        url={`https://designfolio.me`}
      />
      <main className={"pt-[88px] md:pt-[104px] pb-5"}>
        <Home dfToken={dfToken} />
      </main>
    </div>
  );
}

Index.theme = "light";

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  return {
    props: { dfToken: !!dfToken },
  };
};
